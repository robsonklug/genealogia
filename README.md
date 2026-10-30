# Central de Genealogia e Rastreabilidade — TOTVS Protheus

MVP de **rastreabilidade de lotes** (batch genealogy) para o Protheus 12.1.2510: pesquisar por lote, produto, NF, OP, cliente ou fornecedor e navegar pela origem, transformação, movimentação e destino dos materiais, com **evidência explicável** em cada relação (CONFIRMADO, CORRELACIONADO, INDICATIVO, NÃO COMPROVADO), impacto, linha do tempo e situação de qualidade do lote.

> **Status:** MVP concluído (fases 8–18, 2026-10-11). Os 17 itens do critério de aceite (spec seção 47) são verificados com um lote real da base. O que ficou para depois está em [docs/requirements-analysis.md](docs/requirements-analysis.md).

## Como funciona

```
Navegador ── Central de Genealogia (Angular 21 + PO UI 21, grafo Cytoscape.js)
   │  HTTPS + token OAuth2 do Protheus
AppServer Protheus (RPO custom, TLPP)
   ├─ genealogy.api       REST /genealogy/v1: search, node, network, timeline, impact, quality, audit
   ├─ genealogy.engine    busca nível a nível, impacto, timeline, qualidade, score
   ├─ genealogy.adapter   catálogo SQL único (SD5, SD1/SD2, SD3, SD4, SD7, SDD, QEL, SB8, SC2...)
   └─ genealogy.infra     ReadOnlyQuery (só SELECT, parâmetros) e auditoria em SQLite local
   │  somente leitura
SQL Server — base do Protheus
```

A **SD5 é a fonte de verdade do lote**; os documentos de origem são casados pelo **número sequencial**; consumo e produção se ligam pelo **apontamento** (OP + número sequencial). Nada é gravado no banco do Protheus.

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/requirements-analysis.md](docs/requirements-analysis.md) | spec × entregue, critério de aceite, o que fica para depois |
| [docs/architecture.md](docs/architecture.md) | arquitetura, decisões D1–D7, plano de fases |
| [docs/protheus-data-model.md](docs/protheus-data-model.md) | modelo canônico × tabelas, campos e índices do Protheus |
| [docs/traceability-rules.md](docs/traceability-rules.md) | regras R1–R14, lacunas, matriz regra → teste |
| [docs/genealogy-algorithms.md](docs/genealogy-algorithms.md) | busca, derivações, mesma OP, impacto, timeline, qualidade |
| [docs/quality-traceability.md](docs/quality-traceability.md) | situação de qualidade, regras de data quality, score |
| [docs/sql/](docs/sql/README.md) | todas as consultas, JOIN a JOIN, e os planos de execução |
| [docs/security.md](docs/security.md) | somente leitura, autenticação, privacidade, auditoria, código de teste fora da produção |
| [docs/performance.md](docs/performance.md) | metas, medições na base e com genealogia profunda |
| [docs/testing.md](docs/testing.md) | baterias, massa GENTEST, datasets sintéticos |
| [docs/open-questions.md](docs/open-questions.md) | decisões pendentes |
| [docs/discovery-report.md](docs/discovery-report.md), [protheus-live-schema.md](docs/protheus-live-schema.md), [protheus-genealogy-proof.md](docs/protheus-genealogy-proof.md), [test-case-real.md](docs/test-case-real.md), [test-scenario-script.md](docs/test-scenario-script.md) | discovery na base real, schema, prova da genealogia, Golden Dataset e massa de teste |
| [docs/ux-backlog.md](docs/ux-backlog.md) | UX-01: simplificar a leitura (referência SAP) |
| [docs/briefing/](docs/briefing/Prompt_Mestre_Genealogia_Protheus_v1.1.md) | especificação (prevalece sobre o briefing PDF) |

## Estrutura

```
apps/api/src                TLPP da aplicação (vai para produção)
apps/api/test               PROBAT e executor de testes (só ambiente de teste)
apps/api/include            includes TLPP (constantes, interface TraceSource)
apps/web                    Angular 21 + PO UI 21
packages/genealogy-contract tipos do contrato JSON da API (tela e testes)
packages/protheus-db        cliente SQL Server somente leitura (ferramentas de discovery)
scripts/protheus            compilação, massa GENTEST (só teste), lint TLPP
scripts/sql                 SQL Explorer, investigação de lote, planos de docs/sql
scripts/perf, scripts/docs  medição da API e capturas da tela
tests/                      unit, integration (base e API reais), e2e (navegador)
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm web:start` | tela local em http://localhost:4300 (proxy `/rest` → AppServer) |
| `pnpm tlpp:build` | compila os fontes TLPP no RPO do ambiente de teste e reinicia o AppServer |
| `scripts/protheus/compile-and-restart.ps1 -AppOnly` | compila **só** a aplicação (o que pode ir para produção) |
| `pnpm check` / `pnpm check:all` | toda a bateria (typecheck, unitários, lint, PROBAT, integração) / + ponta a ponta |
| `pnpm test`, `test:tlpp`, `test:integration`, `test:e2e` | cada bateria isolada |
| `pnpm lint:tlpp` | reprova escrita e código de teste no fonte da aplicação |
| `pnpm perf:api` | mede a API na base (mediana, consultas, tempo no banco) |
| `pnpm protheus:explain [--write]` | planos de execução de `docs/sql` |
| `pnpm protheus:investigate-lot <LOTE>` | genealogia de um lote direto por SQL (somente leitura) |
| `pnpm gentest:seed <bloco>` | massa GENTEST pelas rotinas padrão (só base de teste) |
| `pnpm docs:screens` | capturas da tela para a documentação |

## Configuração

1. Node 22+, pnpm 10 (`corepack enable pnpm`), Edge (para o teste ponta a ponta) e a extensão TOTVS TDS no VS Code (compilador `advpls`).
2. `cp .env.example .env` e preencher **localmente** (o `.env` nunca é versionado).
3. AppServer com REST em HTTPS e `SECURITY=1`; `LocalFiles=SQLITE` para a auditoria.

Ambiente de desenvolvimento: Windows 11 com Protheus 12.1.2510 e SQL Server locais, base `P1212510` (empresa 99, filial 01, demonstração).

## Regras inegociáveis

- Acesso ao banco do Protheus **somente leitura**; a massa de teste só por rotinas padrão.
- Nunca inventar tabela, campo ou relacionamento: o que não está comprovado na base fica **PENDENTE DE VALIDAÇÃO**.
- Nenhuma credencial em código, documentação ou commits.
- Código de teste nunca vai para o RPO de produção.
