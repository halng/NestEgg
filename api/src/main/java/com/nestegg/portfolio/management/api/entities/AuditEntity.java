/*
 *    Copyright 2025 Hao Nguyen Tan
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package com.nestegg.portfolio.management.api.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@MappedSuperclass
@Getter
@Setter
public abstract class AuditEntity {
	@Id
	@GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
	private UUID id;

	@Version
	private Long version;

	@CreationTimestamp
	@Column(updatable = false, nullable = false)
	private Instant createdAt;

	@UpdateTimestamp
	private Instant updatedAt;

	@Column(nullable = false)
	private Boolean isActive = true;

	@Column(nullable = false)
	private Boolean isDeleted = false;


	public String toString(boolean isMashed) {
		StringBuilder sb = new StringBuilder(this.getClass().getSimpleName() + "{");
		for (var field : this.getClass().getDeclaredFields()) {
			field.setAccessible(true);
			try {
				String value = field.get(this) != null ? field.get(this).toString() : "null";
				if (isMashed) {
					int numCharsToMashed = value.length() / 2;
					String mashed = "*".repeat(numCharsToMashed);
					value = value.substring(0, numCharsToMashed) + mashed;
				}
				sb.append(field.getName()).append("=").append(value).append(", ");
			} catch (IllegalAccessException e) {
				sb.append(field.getName()).append("=ACCESS_ERROR, ");
			}
		}
		// Remove the trailing comma and space, then close the bracket
		if (sb.length() > 2) {
			sb.setLength(sb.length() - 2);
		}
		sb.append("}");
		return sb.toString();
	}
}