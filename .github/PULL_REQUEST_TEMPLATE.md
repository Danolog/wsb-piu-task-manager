## Co?

<!-- Jednym zdaniem: co zmienia ten PR. Bez „różne poprawki" — każda „różna" poprawka to osobny PR. -->

## Dlaczego?

<!-- Jakiemu etapowi / problemowi / decyzji służy ta zmiana? Link do etapu w PLAN.md, do issue, albo do ADR. -->

## Jak przetestowane?

<!-- Ręcznie (jakie kroki?), automatycznie (jakie testy?), oba? -->

- [ ] Uruchomione lokalnie (`npm run dev`)
- [ ] Testy (`npm test`) przechodzą
- [ ] Lint (`npm run lint`) czysty
- [ ] Build (`npm run build`) przechodzi

## Screeny (dla zmian w UI)

<!-- Przed / po. Dla wireframes i Hi-Fi wystarczy link do Figmy. -->

| Przed | Po |
|-------|----|
|       |    |

## Checklist

- [ ] Nazwa brancha: `feature/etapN-opis` / `fix/opis` / `docs/opis`
- [ ] Commit messages w Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- [ ] `CHANGELOG.md` zaktualizowany (sekcja `[Unreleased]`)
- [ ] Dla nowych komponentów — dodane propsy zgodne z design systemem
- [ ] Dla zmian architektonicznych — nowa ADR w `docs/adr/`
- [ ] A11y — wszystko klikalne klawiaturą, focus visible, semantyczny HTML
- [ ] Responsywność — sprawdzone na 375px i 1280px (jeśli UI)
- [ ] PLAN.md / Etap*.md zaktualizowane jeśli plan się zmienia

## Notatki dla review

<!-- Coś czego nie widać z diffa? Trade-offy które warto przedyskutować? Tu piszesz. -->
