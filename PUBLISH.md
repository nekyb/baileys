# Guía de Publicación en NPM

## Requisitos Previos

1. **Cuenta de NPM**: Necesitas una cuenta en [npmjs.com](https://www.npmjs.com/)
2. **Autenticación**: Debes estar autenticado en npm

## Pasos para Publicar

### 1. Autenticarse en NPM

```bash
npm login
```

Ingresa tus credenciales:
- Username
- Password
- Email

### 2. Verificar el Package

Asegúrate de que todo esté correcto:

```bash
npm run build
```

Verifica que el directorio `dist/` se haya generado correctamente.

### 3. Publicar el Paquete

Como el nombre comienza con `@soblend/`, es un paquete con scope. Debes publicarlo como público:

```bash
npm publish --access public
```

### 4. Verificar la Publicación

Una vez publicado, verifica en:
```
https://www.npmjs.com/package/@soblend/baileys
```

## Actualizar Versiones

Cuando hagas cambios, actualiza la versión en `package.json`:

### Para cambios menores (bug fixes):
```bash
npm version patch
```
Ejemplo: 1.0.0 → 1.0.1

### Para nuevas características (features):
```bash
npm version minor
```
Ejemplo: 1.0.0 → 1.1.0

### Para cambios incompatibles (breaking changes):
```bash
npm version major
```
Ejemplo: 1.0.0 → 2.0.0

Luego publica:
```bash
npm publish --access public
```

## Notas Importantes

- El script `prepublishOnly` se ejecutará automáticamente antes de publicar
- Esto compilará el TypeScript automáticamente
- Los archivos en `.npmignore` no se incluirán en el paquete publicado
- Solo se publicará el contenido del directorio `dist/` y archivos de documentación

## Despublicar (Solo si es necesario)

Si necesitas despublicar dentro de las primeras 24 horas:

```bash
npm unpublish @soblend/baileys@version --force
```

⚠️ **Advertencia**: Despublicar es permanente y puede causar problemas si otros ya dependen de tu paquete.

## CI/CD (Opcional)

Para automatizar la publicación, puedes usar GitHub Actions o cualquier otro servicio de CI/CD.

Ejemplo de workflow de GitHub Actions:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Soporte

Para más información, consulta la [documentación oficial de npm](https://docs.npmjs.com/cli/v9/commands/npm-publish).
