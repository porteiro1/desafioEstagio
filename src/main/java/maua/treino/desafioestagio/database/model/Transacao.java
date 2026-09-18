package maua.treino.desafioestagio.database.model;

import jakarta.persistence.*;
import lombok.*;
import maua.treino.desafioestagio.enumered.TipoTransacao;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_transacao")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Transacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;
}
