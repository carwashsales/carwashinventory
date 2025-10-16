import type {NextConfig} from 'next';

const repoName = 'carwashsales';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGithubActions ? `/${repoName}` : '',
  assetPrefix: isGithubActions ? `/${repoName}` : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: {
    allowedDevOrigins: ['https://3000-firebase-carwash-1760364878602.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev'],
  },
};

export default nextConfig;
