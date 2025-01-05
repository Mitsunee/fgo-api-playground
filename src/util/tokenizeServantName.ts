export function tokenizeServantName(name: string) {
  const tokens = new Array<string>();
  let token = "";
  let parens = false;

  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    if (parens && char == ")") {
      token = token.trim();
      if (token.length > 0) tokens.push(token);
      token = "";
      parens = false;
      continue;
    }

    // start of new token with parens
    if (!parens && char == "(" && name[i - 1] == " ") {
      token = token.trim();
      if (token.length > 0) tokens.push(token);
      token = "";
      parens = true;
      continue;
    }

    token += char;
  }

  // process final token
  token = token.trim();
  if (token.length > 0) tokens.push(token);

  // fix tokens missing parens
  let match: RegExpMatchArray | null;
  while ((match = tokens[0].match(/ (Alter|Lily|Santa|Dubai)$/))) {
    tokens.splice(1, 0, match[1]);
    tokens[0] = tokens[0].slice(0, -1 * match[1].length).trimEnd();
  }

  return tokens;
}

export function joinTokenizedName(tokens: string[]) {
  const [root, ...suffixes] = tokens;
  return `${root}${suffixes.map(suffix => ` (${suffix})`).join("")}`;
}

export const classNameTokens = new Set([
  "Saber",
  "Archer",
  "Lancer",
  "Rider",
  "Caster",
  "Assassin",
  "Berserker",
  "Ruler",
  "Avenger",
  "Moon Cancer",
  "Beast"
]);

export function filterClassNameTokens(
  tokens: string[],
  additionalTokens?: Set<string>
) {
  const filteredTokens = classNameTokens.union(additionalTokens || new Set());
  return [tokens[0]].concat(
    tokens.slice(1).filter(token => !filteredTokens.has(token))
  );
}
