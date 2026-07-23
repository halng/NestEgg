package com.nest.egg.gateway.transform;

import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import org.springframework.stereotype.Component;

@Component
public final class ProtobufJsonMapper {
    private final JsonFormat.Parser parser = JsonFormat.parser().ignoringUnknownFields();
    private final JsonFormat.Printer printer = JsonFormat.printer().includingDefaultValueFields();

    public <T extends Message> T fromJson(String json, Message.Builder builder) {
        if (json == null || json.isBlank()) throw new ProtobufMappingException("Request body must contain JSON", null);
        try {
            parser.merge(json, builder);
            @SuppressWarnings("unchecked") T message = (T) builder.build();
            return message;
        } catch (InvalidProtocolBufferException | ClassCastException exception) {
            throw new ProtobufMappingException("JSON is incompatible with the configured Protobuf schema", exception);
        }
    }

    public String toJson(Message message) {
        try {
            return printer.print(message);
        } catch (InvalidProtocolBufferException exception) {
            throw new ProtobufMappingException("Protobuf response could not be serialized", exception);
        }
    }

    public static final class ProtobufMappingException extends RuntimeException {
        public ProtobufMappingException(String message, Throwable cause) { super(message, cause); }
    }
}
