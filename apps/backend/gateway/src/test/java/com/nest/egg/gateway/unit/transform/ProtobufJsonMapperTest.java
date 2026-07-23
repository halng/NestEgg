package com.nest.egg.gateway.unit.transform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.google.protobuf.Struct;
import com.nest.egg.gateway.transform.ProtobufJsonMapper;
import org.junit.jupiter.api.Test;

class ProtobufJsonMapperTest {
    private final ProtobufJsonMapper mapper = new ProtobufJsonMapper();

    @Test
    void mapsNestedRepeatedAndTypedJson() {
        Struct result = mapper.fromJson("{\"name\":\"Ada\",\"tags\":[\"one\",\"two\"],\"profile\":{\"active\":true}}", Struct.newBuilder());
        assertThat(result.getFieldsMap()).containsKeys("name", "tags", "profile");
        assertThat(mapper.toJson(result)).contains("Ada", "active");
    }

    @Test
    void rejectsMalformedJsonWithoutEchoingPayload() {
        assertThatThrownBy(() -> mapper.fromJson("{secret-token", Struct.newBuilder()))
                .isInstanceOf(ProtobufJsonMapper.ProtobufMappingException.class)
                .hasMessage("JSON is incompatible with the configured Protobuf schema")
                .hasMessageNotContaining("secret-token");
    }

    @Test
    void rejectsEmptyPayload() {
        assertThatThrownBy(() -> mapper.fromJson(" ", Struct.newBuilder()))
                .isInstanceOf(ProtobufJsonMapper.ProtobufMappingException.class)
                .hasMessage("Request body must contain JSON");
    }
}
