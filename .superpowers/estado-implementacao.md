# PeakFinder — estado da implementação (atualizado em 2026-11-12)

## Como retomar em uma nova sessão
1. O código está no arquivo `peakfinder-mvp.bundle` na pasta PeakFinder do Bernardo (C:\Users\Avell\Documents\PeakFinder). Restaurar com: `git clone peakfinder-mvp.bundle peakfinder && cd peakfinder && git checkout mvp && npm install`.
2. Spec: `docs/superpowers/specs/2026-11-12-peakfinder-mvp-design.md`. Plano: `docs/superpowers/plans/2026-11-12-peakfinder-mvp.md` (ambos dentro do repo e na pasta do Bernardo).
3. Execução escolhida pelo Bernardo: direta (skill superpowers:executing-plans), branch `mvp`.
4. Chaves do Supabase, e-mail do admin e URL do GitHub estão em `chaves.txt` na pasta PeakFinder (nunca versionar). Projeto Supabase ref: zvxnuelbtmuarivyffak → https://zvxnuelbtmuarivyffak.supabase.co. Repo: https://github.com/bernardopcaron/PeakFinder (falta GITHUB_TOKEN para push).
5. Antes de seguir, testar acesso de rede a *.supabase.co, tiles.openfreemap.org e vercel.com. Em 2026-11-12 estavam bloqueados (proxy 403) tanto no workspace em nuvem quanto no shell do computador; registries Docker também. O Bernardo disse ter liberado os domínios, mas a sessão original não refletiu a mudança.

## Progresso
- Tarefa 0: contas Supabase e GitHub criadas; pendente desligar "Confirm email", ligar extensões postgis e unaccent, e token do GitHub.
- Tarefa 1 (projeto, identidade visual, navegação): concluída, 4 testes e2e passam.
- Tarefa 2 (biblioteca de graus): concluída, 11 testes passam.
- Tarefas 3 a 14: não iniciadas (dependem de acesso ao Supabase).

## Ledger
# SDD ledger — plan: docs/superpowers/plans/2026-11-12-peakfinder-mvp.md
Ruling: desenvolvimento no branch `mvp` do repo em /home/claude/peakfinder — isolamento sem worktree, repo novo — custo se errado: nenhum.
Ruling: Next 16 instalado (create-next-app latest); seguir docs em node_modules/next/dist/docs em vez do conhecimento prévio — custo se errado: retrabalho de convenções.
Pre-flight:
- T2→T6,T8,T10,T12: grauParaOrdem/FAIXAS_*/grausDaModalidade — nomes consistentes.
- T3→T4,T7,T8: eh_admin(), vias_resumo, mapa_geojson(), buscar() — consistentes.
- T4→T6,T10-14: testes/apoio/usuarios.ts — consistente.
- T5→T10-13: ResultadoAcao, exigirUsuario, exigirAdmin — consistentes.
- T8→T12: SeletorPonto {lat,lng} — consistente.
- T11→T12: enviarArquivo/validarArquivo — consistente; T6 seed precisa subir GLB sem enviarArquivo (usa service_role direto) — ok.
- T0 bloqueia T3+; T1,T2 independem.
Task 1: Ruling: Inter auto-hospedada via @fontsource-variable/inter em vez de next/font/google — build não depende de rede externa (falhou no sandbox) — custo se errado: troca de 3 linhas.
Task 1: complete (commits 16c3c3e..2b8a0af, tests: npx playwright test casca →   4 passed (6.5s))
Task 2: complete (commits 2b8a0af..8938e5e, tests: npm test →    Duration  160ms (import 41%, tests 26%, transform 23%, worker 9%))
Task 0: chaves recebidas (ref zvxnuelbtmuarivyffak, chaves sb_publishable/sb_secret). GITHUB_REPO veio sem dono/URL nem token.
Task 0: BLOQUEIO — nem o workspace em nuvem nem o shell do computador do Bernardo alcançam *.supabase.co, vercel.com, tiles.openfreemap.org (proxy 403). Registries Docker também bloqueados (sem Supabase local). github.com e npm ok. Aguardando decisão do Bernardo sobre liberar domínios.
