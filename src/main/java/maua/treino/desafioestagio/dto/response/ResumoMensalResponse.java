package maua.treino.desafioestagio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ResumoMensalResponse {
    private final BigDecimal totalEntradas;
    private final BigDecimal totalSaidas;
    private final BigDecimal saldo;
}
