package maua.treino.desafioestagio.database.repository;

import maua.treino.desafioestagio.database.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
}
