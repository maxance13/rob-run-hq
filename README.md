# ROB RUN HQ

Compagnon francophone de ROB RUN. Interface React/TypeScript, routes Next.js sur Vinext et stockage relationnel D1 pour le site hébergé. La première publication est initialisée depuis `lib/catalog.ts` après application des migrations de `drizzle/`. Les versions éditoriales sont des instantanés immuables et la publication change le pointeur actif en transaction. Conserver les slugs lors des imports pour préserver les URL et les relevés historiques.

## Développement

Utiliser Node.js ≥ 22.13. Installer par `npm run install:ci`, construire par `npm run build`, appliquer la migration D1 à la base locale puis lancer `npm run dev`.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_redundant_jetstream.sql
```

## Édition

Le site commence en accès privé. Le propriétaire active son rôle dans `/admin/imports`, ce qui verrouille les actions éditoriales à son identifiant. Effectuer cette activation tant que l’audience est privée avant toute éventuelle ouverture. Pour mettre les données à jour, charger le catalogue actif, éditer son JSON, vérifier les écarts, enregistrer le brouillon, puis le publier. Une révision antérieure peut être réactivée depuis l’historique. Les API de consultation et de simulation ne requièrent pas de compte côté application. L’accès au site privé reste géré par son hébergeur.

Le corpus initial utilise des sources publiques communautaires. La version exacte vérifiée des fiches et les taux serveur restent inconnus. La collecte est ouverte pour le build Steam documenté dans l’interface. Les justificatifs photo, les imports CSV directs et la synchronisation avec une base externe ne sont pas configurés.

## Version publique sur Render

Créer un service **Static Site** depuis la branche `main`. Utiliser Node.js 24, la commande `npm ci --include=dev && npm run build:render` et le dossier de publication `dist/render`. Le build génère les pages et les fiches wiki en HTML avec le catalogue versionné du dépôt. Les filtres, calculateurs et liens de simulation restent interactifs.

Les observations, la modération et les imports restent accessibles depuis le site privé qui conserve la base D1. Publier un nouveau catalogue sur Render passe par une mise à jour du code source suivie d’un build.
