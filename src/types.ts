export interface GithubUrl {
	repo: string;
	type?: "tree" | "blob";
	branch?: string;
	path?: string[];
}

export interface Locs {
	loc: number;
	locByLangs: Record<string, number>;
	children?: Record<string, Locs>;
}
