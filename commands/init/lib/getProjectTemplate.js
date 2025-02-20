const projectTemplates = {
  data: [
    {
      name: "monorepo-project",
      npmName: "@msfe/monorepo-project",
      version: "0.0.12",
      type: "normal",
      installCommand: "pnpm install",
      startCommand: "pnpm -F app1-webapp dev",
      ignore: ["**.png"],
      tag: ["project"],
    },
    {
      name: "monorepo-app",
      npmName: "@msfe/monorepo-app",
      version: "latest",
      type: "normal",
      installCommand: "pnpm install",
      startCommand: "pnpm run dev",
      ignore: ["**/public/*", "**.png"],
      tag: ["project"],
    },
    {
      name: "service-app",
      npmName: "@msfe/midway-service-template",
      version: "latest",
      type: "normal",
      installCommand: "pnpm install",
      startCommand: "pnpm run dev",
      ignore: ["**.png"],
      tag: ["project"],
    },
    {
      name: "bff-app",
      npmName: "@msfe/midway-template",
      version: "latest",
      type: "normal",
      installCommand: "pnpm install",
      startCommand: "pnpm run dev",
      ignore: ["**/public/*", "**.png"],
      tag: ["project"],
    },
    {
      name: "react-umi4",
      npmName: "@msfe/react-umi4-temp",
      version: "latest",
      type: "normal",
      installCommand: "yarn install",
      startCommand: "yarn start",
      ignore: ["**/public/*", "**.png"],
      tag: ["project"],
    },
    {
      name: "react-vite",
      npmName: "@msfe/react-vite-temp",
      version: "latest",
      installCommand: "yarn install",
      startCommand: "yarn start",
      ignore: ["**/public/*", "**.png"],
      tag: ["project"],
    },
    {
      name: "react-component",
      npmName: "@msfe/react-component-temp",
      version: "latest",
      installCommand: "yarn install",
      startCommand: "yarn start",
      ignore: ["**.png"],
      tag: ["component"],
    },
    {
      name: "eggjs-framework",
      npmName: "@msfe/eggjs-framework",
      version: "latest",
      installCommand: "yarn install",
      startCommand: "yarn dev",
      ignore: ["**.png"],
      tag: ["project"],
    },
    {
      name: "go-framework",
      npmName: "@msfe/go-framework",
      version: "latest",
      installCommand: "go mod tidy",
      startCommand: "go run ./cmd/web/web.go",
      ignore: ["**.png"],
      tag: ["project"],
    },
    {
      name: "vue3-vite-pinia",
      npmName: "@msfe/vue3-vite-pinia",
      version: "latest",
      installCommand: "yarn install",
      startCommand: "yarn dev",
      ignore: ["**.png"],
      tag: ["project"],
    },
  ],
};

const getProjectTemplate=()=>{
  return projectTemplates.data
}

module.exports =()=>{
  return projectTemplates.data
}

