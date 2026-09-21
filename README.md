# Controle financeiro

Aplicação desenvolvida para o desafio de estágio da HSP Software, na opção **Controle Financeiro**. Permite registrar entradas e saídas, consultar as movimentações de um mês e visualizar seus totais.

O saldo corresponde às entradas menos as saídas **do período selecionado**. Ele não acumula valores de meses anteriores.

## Funcionalidades

- Cadastro de transações com descrição, valor, data e tipo (`ENTRADA` ou `SAIDA`).
- Consulta por mês e ano, ordenada da data mais recente para a mais antiga.
- Resumo mensal com total de entradas, total de saídas e saldo.
- Persistência em PostgreSQL e validação dos dados na API e no formulário.
- Interface responsiva com estados de carregamento, erro, sucesso e lista vazia.
- Atualização da consulta após um cadastro. Se a data cadastrada pertencer a outro mês, selecione esse período para ver a transação.

## Tecnologias e requisitos

| Parte | Tecnologias | Requisitos para executar |
| --- | --- | --- |
| Backend | Java, Spring Boot 4.1.1, Spring Data JPA, Bean Validation e Lombok | JDK 17 ou superior |
| Frontend | React 19, Vite 8 e CSS | Node.js 22.12 ou superior, com npm |
| Banco de dados | PostgreSQL | Servidor em execução e credenciais de acesso |

O Maven Wrapper está incluído; não é necessário instalar o Maven separadamente. A primeira execução precisa de internet para baixar as dependências. O frontend inclui `package-lock.json`, utilizado por `npm ci` para instalar as versões registradas.

## Como executar

### 1. Clonar o repositório

```sh
git clone https://github.com/porteiro1/desafioEstagio.git
cd desafioEstagio
```

### 2. Preparar o PostgreSQL

Com o PostgreSQL em execução, crie um banco para a aplicação. Pelo terminal, utilizando um usuário com permissão para criar bancos:

```sh
createdb -h localhost -p 5432 -U postgres desafio_estagio
```

Substitua `postgres` pelo seu usuário, se necessário. O comando solicita a senha quando a configuração do servidor exigir. Também é possível criar o banco pelo pgAdmin. Se o banco já existir, pule esta etapa.

As tabelas são criadas ou atualizadas pelo Hibernate na inicialização, pois o projeto utiliza `spring.jpa.hibernate.ddl-auto=update`. O usuário configurado na aplicação precisa de permissão para criar tabelas nesse banco. A entidade de transação utiliza a tabela `tb_transacao`.

### 3. Iniciar o backend

Na raiz do repositório, em Linux ou macOS:

```sh
env SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/desafio_estagio' \
    SPRING_DATASOURCE_USERNAME='postgres' \
    SPRING_DATASOURCE_PASSWORD='sua_senha_local' \
    ./mvnw spring-boot:run
```

Substitua o usuário e `sua_senha_local` pelos dados do seu PostgreSQL. Essas variáveis configuram a conexão apenas para o comando executado; não é necessário colocar a senha em arquivos do repositório.

No Windows, utilizando PowerShell:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/desafio_estagio'
$env:SPRING_DATASOURCE_USERNAME = 'postgres'
$env:SPRING_DATASOURCE_PASSWORD = 'sua_senha_local'
.\mvnw.cmd spring-boot:run
```

Também é possível iniciar pelo IntelliJ: configure essas três variáveis de ambiente na configuração de execução e execute `DesafioEstagioApplication`.

O backend atende em [http://localhost:8080](http://localhost:8080). Para conferir a API, abra [a consulta de setembro de 2026](http://localhost:8080/transacoes?ano=2026&mes=9). Em um banco sem registros, a resposta será `[]`.

Sem a variável `SPRING_DATASOURCE_URL`, `application.properties` aponta para o banco `postgres` em `localhost:5432`. Os comandos acima substituem esse endereço pelo banco dedicado `desafio_estagio`.

### 4. Iniciar o frontend

Mantenha o backend em execução e abra outro terminal. A partir da raiz do repositório:

```sh
cd frontend
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente [http://localhost:5173](http://localhost:5173). Se essa porta estiver ocupada, o Vite pode utilizar outra.

A interface começa com setembro de 2026 selecionado. Escolha o período desejado e clique em **Consultar**. Para registrar uma movimentação, preencha o formulário **Nova transação**.

Durante o desenvolvimento, o Vite encaminha as requisições iniciadas por `/transacoes` para `http://localhost:8080`, conforme `frontend/vite.config.js`. Os dois servidores precisam permanecer em execução. Se a porta do backend mudar, ajuste o destino do proxy nesse arquivo.

## API

Endereço base: `http://localhost:8080`.

| Método | Rota | Resultado de sucesso |
| --- | --- | --- |
| `POST` | `/transacoes` | `201 Created`, sem corpo na resposta |
| `GET` | `/transacoes?ano=2026&mes=9` | `200 OK`, com a lista do mês |
| `GET` | `/transacoes/resumo?ano=2026&mes=9` | `200 OK`, com os totais do mês |

### Exemplo de cadastro

```sh
curl -i -X POST http://localhost:8080/transacoes \
  -H 'Content-Type: application/json' \
  -d '{"descricao":"Salário","valor":1000.00,"data":"2026-09-18","tipo":"ENTRADA"}'
```

O comando grava uma transação. Para uma saída, envie `"tipo":"SAIDA"`, mantendo o valor positivo.

### Exemplo de consulta do resumo

```sh
curl 'http://localhost:8080/transacoes/resumo?ano=2026&mes=9'
```

Considerando apenas uma entrada de R$ 1.000,00 e uma saída de R$ 150,75 nesse mês, o resultado é:

```json
{
  "totalEntradas": 1000.00,
  "totalSaidas": 150.75,
  "saldo": 849.25
}
```

Meses sem movimentações retornam uma lista vazia na consulta e valores zero no resumo.

### Validações

- Descrição obrigatória, com no máximo 255 caracteres e ao menos um caractere que não seja espaço em branco.
- Valor obrigatório, maior que zero, com até 10 dígitos inteiros e 2 casas decimais.
- Data obrigatória, enviada no formato `AAAA-MM-DD`.
- Tipo obrigatório: `ENTRADA` ou `SAIDA`.
- Nas consultas, ano entre 1 e 9999 e mês entre 1 e 12, ambos obrigatórios.

Requisições que violam essas validações retornam `400 Bad Request`. Os cálculos monetários no backend utilizam `BigDecimal` e as datas utilizam `LocalDate`.

## Organização do código

| Local | Responsabilidade |
| --- | --- |
| `src/main/java/maua/treino/desafioestagio/controller` | Receber as requisições HTTP e validar os parâmetros |
| `src/main/java/maua/treino/desafioestagio/service` | Criar transações, consultar o período e calcular o resumo |
| `src/main/java/maua/treino/desafioestagio/database` | Entidade JPA e repositório de acesso ao banco |
| `src/main/java/maua/treino/desafioestagio/dto` | Dados recebidos no cadastro e resposta do resumo |
| `src/main/resources/application.properties` | Configuração da aplicação e da persistência |
| `frontend/src/App.jsx` | Estado da interface, chamadas à API e componentes da tela |
| `frontend/src/App.css` e `frontend/src/index.css` | Estilos da aplicação |

## Verificações

No diretório `frontend`, execute:

```sh
npm run lint
npm run build
```

O primeiro comando verifica o código com Oxlint. O segundo gera os arquivos do frontend em `frontend/dist`. Esse build não inicia o backend nem configura uma publicação da aplicação; o passo a passo acima utiliza o servidor de desenvolvimento.

Para empacotar o backend sem executar os testes, na raiz:

```sh
./mvnw -DskipTests package
```

O teste automatizado existente verifica a inicialização do contexto Spring e precisa do PostgreSQL em execução. Em Linux ou macOS, configure a conexão também ao executar os testes:

```sh
env SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/desafio_estagio' \
    SPRING_DATASOURCE_USERNAME='postgres' \
    SPRING_DATASOURCE_PASSWORD='sua_senha_local' \
    ./mvnw test
```

No PowerShell, utilize as variáveis configuradas anteriormente e execute `.\mvnw.cmd test`. Ainda não há testes automatizados específicos das regras de negócio ou da interface.

Para conferir o fluxo manualmente, use um mês sem registros anteriores:

| Verificação | Resultado esperado |
| --- | --- |
| Consultar o mês vazio | Mensagem de lista vazia e totais zerados |
| Cadastrar uma entrada de R$ 1.000,00 e uma saída de R$ 150,75 nesse mês | Duas transações e saldo de R$ 849,25 |
| Consultar outro mês sem registros | As transações do mês anterior não aparecem |
| Enviar valor negativo diretamente à API | Resposta `400 Bad Request` |
| Recarregar a página e consultar novamente | Registros mantidos no PostgreSQL |

## Escopo e decisões

O desenvolvimento priorizou o fluxo completo pedido no desafio: cadastrar entradas e saídas, persistir os dados e consultar as movimentações e o saldo mensal pela interface.

- Edição, exclusão, categorias e autenticação ficaram fora do escopo para concentrar o trabalho nesse fluxo.
- A listagem não possui paginação e o resumo é calculado a partir das transações do mês carregadas em memória. Essa implementação mantém a lógica simples para o volume esperado no desafio; volumes maiores pediriam paginação e agregação no banco.
- A estrutura do banco utiliza a atualização automática do Hibernate para simplificar a execução local. Migrações versionadas não foram implementadas.
- O frontend concentra sua lógica em `App.jsx`, por se tratar de uma única tela. A separação em componentes menores e uma camada própria de acesso à API ficou como melhoria futura.
- A suíte de testes ainda se limita à inicialização do contexto. Testes das regras de negócio e dos fluxos da interface ficaram fora desta versão.
- A entrega foi preparada para execução local; não inclui configuração de implantação em produção.

## Uso de IA

O ChatGPT foi utilizado como apoio para compreender React e a integração com Spring, investigar erros, gerar e revisar trechos de código e organizar a interface e a documentação. O desenvolvimento ocorreu de forma incremental, com execução local e conferência dos resultados durante o processo.

Conforme solicitado no desafio, o histórico completo das conversas e interações deve acompanhar a entrega. Esta descrição do uso de IA não substitui esse histórico.
