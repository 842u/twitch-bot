const baseConfig = {
	"*.{js,mjs}": ["npx @biomejs/biome check --write"],
	"*.{ts,mts}": ["npx @biomejs/biome check --write"],
	"*.json": ["npx @biomejs/biome check --write"],
};

export default baseConfig;
