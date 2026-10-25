# Contributing

Este documento resume os padrões de contribuição da FluxConnect. O fluxo completo está em [Git Workflow](docs/workflows/git.flow.md).

Antes de contribuir, consulte também:

- [Jira da FluxConnect](https://hudsonalves.atlassian.net/jira/software/projects/FLUX/boards/2/backlog): tarefas, bugs e acompanhamento do trabalho;
- [Confluence da FluxConnect](https://hudsonalves.atlassian.net/wiki/spaces/FLUXCONNEC/pages/2850826/Planejamento+de+Release+-+FluxConnect): requisitos e documentação funcional;
- [Figma da FluxCo](https://www.figma.com/design/9z6iO92cGNvb3EHdUbRoXu/FluxConnect-1.0?node-id=24-321&t=2wR11RCgORX67B8h-0): protótipos e referências de interface.

## Fluxo de desenvolvimento

Todo trabalho deve estar associado a um item do Jira. Use a chave em letras maiúsculas, como `FLUX-123`, na branch, em cada commit e no título do Pull Request. Se o item ainda não existir, crie-o antes de iniciar o desenvolvimento; não invente uma chave.

Atualize a branch principal:

```bash
git checkout main
git pull
```

Crie a branch no formato `FLUX-XXX-tipo/descricao-curta`:

```bash
git checkout -b FLUX-123-feat/tela-login
```

Após realizar uma alteração lógica:

```bash
git add .
git commit -m "FLUX-123 feat: implementar tela de login"
git push -u origin FLUX-123-feat/tela-login
```

Depois, abra um Pull Request para `main` com o título:

```text
FLUX-123 Implementar tela de login
```

O envio da branch e dos commits para o repositório conectado é necessário para que o Jira reconheça e sincronize os dados de desenvolvimento.

## Antes de abrir um Pull Request

Certifique-se de que sua branch está atualizada:

```bash
git checkout main
git pull

git checkout FLUX-123-feat/tela-login
git merge main
```

Execute as verificações disponíveis no projeto. O Pull Request não deve introduzir erros de lint, build ou testes.

Preencha o template do Pull Request, incluindo:

- o link do item no Jira;
- o link do requisito no Confluence, quando aplicável;
- o link do arquivo, página ou frame no Figma, quando aplicável;
- instruções de teste e evidências;
- a atualização de `[Não publicado]` no `CHANGELOG.md`, quando relevante para uma release.

## Revisão

Durante a revisão de um Pull Request:

- responda aos comentários realizados;
- faça as correções na mesma branch;
- envie novos commits com a mesma chave do Jira;
- mantenha o Pull Request focado em uma única tarefa ou objetivo.

Evite misturar alterações não relacionadas no mesmo Pull Request.

## Resumo

```text
Jira:         FLUX-123 - Criar tela de login
Branch:       FLUX-123-feat/tela-login
Commit:       FLUX-123 feat: implementar tela de login
Pull Request: FLUX-123 Implementar tela de login
```

```text
Jira
  ↓
Branch
  ↓
Commits
  ↓
Pull Request
  ↓
main
```
