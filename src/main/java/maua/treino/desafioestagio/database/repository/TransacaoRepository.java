package maua.treino.desafioestagio.database.repository;

import maua.treino.desafioestagio.database.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findByDataBetweenOrderByDataDesc(LocalDate inicio, LocalDate fim);
}
