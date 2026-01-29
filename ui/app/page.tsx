import Image from "next/image";
import Link from "next/link";
'use client';

import { mockStocks } from './data/mockStocks';
import { useStockScreening } from './hooks/useStockScreening';
import { StockList } from './components/StockList';
import { FilterPanel } from './components/FilterPanel';

export default function Home() {
  const {
    filters,
    filteredStocks,
    updateFilter,
    clearAllFilters,
    filtersActive,
    totalStocks,
  } = useStockScreening(mockStocks);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to NestEgg
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Your privacy-first, offline-capable personal finance and asset management platform.
            NestEgg - Your Investment Platform
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A privacy-first, offline-capable personal finance platform.
            Discover stocks that meet your investment criteria.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[200px]"
            href="/stock-screener"
          >
            View Stock Universe
          </Link>
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[180px]"
            href="/screener"
          >
            Stock Screener
          </Link>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            NestEgg Stock Screener
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Apply financial filters to identify companies matching your investment criteria
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel - Sidebar on large screens */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <FilterPanel
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearAllFilters}
                hasActiveFilters={filtersActive}
              />
            </div>
          </div>

          {/* Stock List - Main content area */}
          <div className="lg:col-span-3">
            <StockList stocks={filteredStocks} totalCount={totalStocks} />
          </div>
        </div>
      </div>
    </div>
  );
}
