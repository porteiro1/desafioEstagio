package maua.treino.desafioestagio.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import maua.treino.desafioestagio.database.model.Transacao;
import maua.treino.desafioestagio.dto.request.TransacaoRequest;
import maua.treino.desafioestagio.dto.response.ResumoMensalResponse;
import maua.treino.desafioestagio.service.TransacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transacoes")
@RequiredArgsConstructor
public class TransacaoController {
    private final TransacaoService service;

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public void criar(@Valid @RequestBody TransacaoRequest request){
        service.criar(request);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Transacao> listarPorMes(@RequestParam("ano") @Min(1) @Max(9999) int ano,
                                        @RequestParam("mes") @Min(1) @Max(12) int mes){
       return service.listaPorMes(ano,mes);
    }

    @GetMapping("/resumo")
    @ResponseStatus(HttpStatus.OK)
    public ResumoMensalResponse resumo(@RequestParam("ano") @Min(1) @Max(9999) int ano,@RequestParam("mes") @Min(1) @Max(12) int mes){

       return service.resumirMes(ano,mes);
    }
}
