# Specification

## Requirement: Publicación npm desde CI

As a maintainer, I want npm releases to be published only from Jenkins, so that releases follow the shared CI standard.

#### Scenario: Configuración del pipeline

- GIVEN el repositorio preparado para CI
- WHEN Jenkins lee el Jenkinsfile de la raíz
- THEN el fichero contiene exactamente `@Library('jenkins-voip-reporter@main') _` y `publishNpmLibrary()` en líneas consecutivas

#### Scenario: Patch automático

- GIVEN un push a `main` que no haya cambiado ya la versión
- WHEN Jenkins ejecuta el pipeline compartido
- THEN incrementa el patch, crea el commit `chore(release): vX.Y.Z [ci skip]` y el tag `vX.Y.Z`, y publica en npm

#### Scenario: Release minor o major

- GIVEN una copia de trabajo adecuada para una release
- WHEN el mantenedor ejecuta `npm run release:minor` o `npm run release:major`
- THEN el script incrementa la versión correspondiente, crea el commit `chore(release): vX.Y.0` sin `[ci skip]` y hace push sin publicar en npm
- AND Jenkins reconoce la versión ya modificada y la publica sin volver a incrementarla

#### Scenario: Scripts y versión existentes

- GIVEN el `package.json` actualizado
- WHEN se inspeccionan sus scripts y su campo `version`
- THEN `postpublish`, `release:patch` y `prerelease` no existen, ningún script ejecuta `npm publish`, y `version:patch`, `version:minor` y `version:major` permanecen sin cambios
- AND el campo `version` conserva su valor anterior al cambio

#### Scenario: Comprobación de CI

- GIVEN las dependencias instaladas
- WHEN se ejecuta `npm run check`
- THEN se ejecutan `npm run build` y después `npm test`, y el comando solo tiene éxito si ambos pasan

#### Scenario: Documentación de releases

- GIVEN la sección «Releasing» del README
- WHEN un mantenedor consulta cómo publicar
- THEN encuentra en cuatro líneas el patch automático en CI, los comandos `npm run release:minor` y `npm run release:major`, y que solo CI publica, sin detalles internos del pipeline
