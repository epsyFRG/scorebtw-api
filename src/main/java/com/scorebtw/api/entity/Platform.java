package com.scorebtw.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "platforms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Platform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String manufacturer;

    @ManyToMany(mappedBy = "platforms")
    private Set<Game> games = new HashSet<>();
}
