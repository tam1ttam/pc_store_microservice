package com.devteria.identity.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;

    /** Tên định danh duy nhất — dùng trong @PreAuthorize("hasAuthority('NAME')") */
    @Column(name = "name", unique = true, nullable = false)
    String name;

    /** Nhóm logic (vd: product, order, chat) — dùng để gom nhóm hiển thị */
    @Column(name = "group_name")
    String group;

    /** URL thực tế của route tương ứng */
    @Column(name = "url")
    String url;

    /** Mô tả chi tiết route làm gì */
    @Column(name = "description")
    String description;
}
