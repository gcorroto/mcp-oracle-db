# Tasks

## 1. Configuración y documentación

- [ ] 1.1 Añadir el `Jenkinsfile` raíz con exactamente `@Library('jenkins-voip-reporter@main') _` y `publishNpmLibrary()` en líneas consecutivas (Scenario: Configuración del pipeline).
- [ ] 1.2 En `package.json`, eliminar `postpublish`, `release:patch` y `prerelease`; añadir `check` con `npm run build && npm test`; conservar `version:patch|minor|major` y el campo `version` sin cambios (Scenarios: Scripts y versión existentes; Comprobación de CI).
- [ ] 1.3 Configurar `release:minor` y `release:major` exactamente como indica la issue: ejecutar el script de versión correspondiente, hacer `git commit -am "chore(release): v$(node -p "require('./package.json').version")"` y `git push`, sin publicar (Scenario: Release minor o major).
- [ ] 1.4 Documentar en cuatro líneas la sección «Releasing» del README: patch automático en CI, comandos minor/major y publicación exclusiva desde CI, sin detalles internos (Scenario: Documentación de releases).

## 2. Verificación local

- [ ] 2.1 Comparar el Jenkinsfile con el contenido exacto requerido y revisar los scripts, los comandos de release, la ausencia de `npm publish`, los scripts de versión y el valor original de `version`, sin ejecutar releases ni hacer push (Scenarios: Configuración del pipeline; Release minor o major; Scripts y versión existentes).
- [ ] 2.2 Revisar las cuatro líneas de «Releasing» frente a la issue (Scenario: Documentación de releases).
- [ ] 2.3 Instalar dependencias si es necesario y ejecutar `npm run check`; registrar en el PR cualquier comprobación no ejecutable y señalar los tests que requieran una base Oracle real (Scenario: Comprobación de CI).

## Verificación tras el despliegue

- [ ] Comprobar en Jenkins, tras un push aplicable a `main`, el patch, commit con `[ci skip]`, tag y publicación npm (Scenario: Patch automático).
- [ ] Comprobar en una release minor o major autorizada que Jenkins publica la versión ya incrementada sin volver a subirla (Scenario: Release minor o major).
