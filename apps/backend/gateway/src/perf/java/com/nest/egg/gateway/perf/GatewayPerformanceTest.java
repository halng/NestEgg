package com.nest.egg.gateway.perf;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.LongAdder;

/** Dependency-free Java load runner intended for CI and production-like environments. */
public final class GatewayPerformanceTest {
    private static final URI TARGET = URI.create(System.getenv().getOrDefault("BASE_URL", "http://localhost:1080") + "/api/v1/users/me");
    private static final String TOKEN = System.getenv("TOKEN");

    private GatewayPerformanceTest() {}

    public static void main(String[] args) throws InterruptedException {
        Profile profile = Profile.named(args.length == 0 ? "baseline" : args[0]);
        var results = new ConcurrentLinkedQueue<Long>();
        var failures = new LongAdder();
        var total = new LongAdder();
        var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
        Instant deadline = Instant.now().plus(profile.duration());

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            while (Instant.now().isBefore(deadline)) {
                int concurrency = profile.concurrencyAt(Duration.between(deadline.minus(profile.duration()), Instant.now()));
                for (int index = 0; index < concurrency; index++) {
                    executor.submit(() -> invoke(client, results, failures, total));
                }
                Thread.sleep(1_000);
            }
        }

        var latencies = new ArrayList<>(results);
        latencies.sort(Comparator.naturalOrder());
        double failureRate = total.sum() == 0 ? 1 : failures.sum() / (double) total.sum();
        long p95 = percentile(latencies, .95);
        long p99 = percentile(latencies, .99);
        System.out.printf(Locale.ROOT,
                "{\"profile\":\"%s\",\"requests\":%d,\"failures\":%d,\"failureRate\":%.5f,\"p95Ms\":%d,\"p99Ms\":%d}%n",
                profile.name(), total.sum(), failures.sum(), failureRate, p95, p99);
        if (failureRate >= .01 || p95 >= 500 || p99 >= 1_000) System.exit(1);
    }

    private static void invoke(HttpClient client, ConcurrentLinkedQueue<Long> results, LongAdder failures, LongAdder total) {
        var request = HttpRequest.newBuilder(TARGET).timeout(Duration.ofSeconds(10)).GET();
        if (TOKEN != null && !TOKEN.isBlank()) request.header("Authorization", "Bearer " + TOKEN);
        long started = System.nanoTime();
        try {
            int status = client.send(request.build(), HttpResponse.BodyHandlers.discarding()).statusCode();
            if (status >= 500) failures.increment();
        } catch (Exception exception) {
            failures.increment();
        } finally {
            results.add(Duration.ofNanos(System.nanoTime() - started).toMillis());
            total.increment();
        }
    }

    private static long percentile(List<Long> sorted, double percentile) {
        if (sorted.isEmpty()) return Long.MAX_VALUE;
        return sorted.get(Math.min(sorted.size() - 1, (int) Math.ceil(sorted.size() * percentile) - 1));
    }

    private record Profile(String name, int startConcurrency, int peakConcurrency, Duration duration) {
        static Profile named(String name) {
            return switch (name) {
                case "baseline" -> new Profile(name, 25, 25, Duration.ofMinutes(2));
                case "peak" -> new Profile(name, 100, 100, Duration.ofMinutes(5));
                case "stress" -> new Profile(name, 25, 250, Duration.ofMinutes(7));
                case "spike" -> new Profile(name, 300, 10, Duration.ofSeconds(70));
                case "soak" -> new Profile(name, 50, 50, Duration.ofHours(1));
                default -> throw new IllegalArgumentException("Unknown profile: " + name);
            };
        }

        int concurrencyAt(Duration elapsed) {
            double progress = Math.min(1, elapsed.toMillis() / (double) duration.toMillis());
            return (int) Math.round(startConcurrency + ((peakConcurrency - startConcurrency) * progress));
        }
    }
}
