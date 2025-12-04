import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";


// eu sei que devia estar na .env, mas é para simplificar o projeto
const jwtSecret = "6139dbdfb3fb3d3574b74d5484eb40cddd17f27460815b2956de15e94abc4ac5";

// Rotas protegidas que requerem autenticação e role específica
const protectedRoutes = [
  { path: "/painel/organizador", role: "organizador" },
  { path: "/painel/avaliador", role: "avaliador" },
  { path: "/painel/autor", role: "autor" },
] as const;

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  "/login",
  "/cadastro",
  "/",
  "/forbidden",
] as const;

/**
 * Proxy function que intercepta requisições para verificar autenticação e autorização
 * Executa antes das rotas serem renderizadas
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const currentPath = request.nextUrl.pathname;

  // Permite acesso a rotas públicas sem verificação
  if (publicRoutes.includes(currentPath as any)) {
    return NextResponse.next();
  }

  // Se não tiver token, redireciona para login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Adiciona o path atual como query param para redirecionar após login
    loginUrl.searchParams.set("redirect", currentPath);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verifica e decodifica o token JWT
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    
    // Extrai o tipo de usuário do payload (normalizado para minúsculas)
    const userType = (payload["UserType"] as string)?.toLowerCase();
    
    if (!userType) {
      console.warn("Token não contém UserType claim");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verifica se a rota atual requer uma role específica
    const matchingRoute = protectedRoutes.find((route) =>
      currentPath.startsWith(route.path)
    );

    if (matchingRoute) {
      // Compara a role do usuário com a role requerida pela rota
      if (userType !== matchingRoute.role) {
        console.warn(
          `Acesso negado: usuário ${userType} tentando acessar rota ${matchingRoute.path} que requer ${matchingRoute.role}`
        );
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
    }

    // Usuário autenticado e autorizado, permite acesso
    return NextResponse.next();
  } catch (error) {
    // Token inválido, expirado ou corrompido
    console.error("Erro ao verificar token:", error);
    
    // Remove o cookie inválido
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    
    return response;
  }
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico, sitemap.xml, robots.txt (metadata files)
       * - imagens e arquivos estáticos (adicionado agora)
       */
      '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  }