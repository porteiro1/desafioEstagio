package maua.treino.desafioestagio.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import maua.treino.desafioestagio.enumered.TipoTransacao;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransacaoRequest {

    @NotBlank(message = "descrição é obrigatório")
    @Size(max = 255, message = "a descrição pode ter no máximo 255 caracteres")
    private String descricao;

    @NotNull(message = "o valor é obrigatório")
    @Positive(message = "o valor deve ser positivo")
    @Digits(integer = 10,fraction = 2)
    private BigDecimal valor;

    @NotNull
    private LocalDate data;

    @NotNull(message = "o tipo é obrigatório")
    private TipoTransacao tipo;


}
