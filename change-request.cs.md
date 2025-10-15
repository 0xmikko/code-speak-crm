I laucnhed `pnpm build` and got errors, please fix! 

> code-speak-crm@0.1.0 build /home/mikko/Coding/code-speak-crm
> next build

   ▲ Next.js 14.0.4
   - Experiments (use at your own risk):
     · typedRoutes

Failed to compile.

./src/app/api/assets/[id]/business-dd/route.ts
Module not found: Can't resolve '@/lib/auth'

https://nextjs.org/docs/messages/module-not-found

./src/app/api/assets/[id]/business-dd/route.ts
Module not found: Can't resolve '@/lib/db'

https://nextjs.org/docs/messages/module-not-found

./src/app/api/assets/[id]/integration-build/route.ts
Module not found: Can't resolve '@/lib/auth'

https://nextjs.org/docs/messages/module-not-found

./src/app/api/assets/[id]/integration-build/route.ts
Module not found: Can't resolve '@/lib/db'

https://nextjs.org/docs/messages/module-not-found

./src/app/api/assets/[id]/integration-build/route.ts
Module not found: Can't resolve '@/lib/db-types'

https://nextjs.org/docs/messages/module-not-found


> Build failed because of webpack errors
   Creating an optimized production build  . ELIFECYCLE  Command failed with exit code 1.