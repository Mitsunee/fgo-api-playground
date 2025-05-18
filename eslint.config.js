import foxkit from "eslint-config-foxkit/flat.js";
import prettierCfg from "eslint-config-prettier";
import * as importPlugin from "eslint-plugin-import";
import tsEslint from "typescript-eslint";

/**
 * Patch import plugin config with custom file extensions and configure rules
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const importCfg = {
  name: "import/custom-config",
  files: ["**/*.?(m)js", "**/*.ts"],
  extends: [importPlugin.flatConfigs.recommended],
  rules: {
    "sort-imports": "off",
    "import/order": "off",
    "import/no-unresolved": "off",
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import/no-duplicates": "off",
    "import/no-useless-path-segments": "error",
    "import/no-self-import": "error",
    "import/no-default-export": "error"
  },
  languageOptions: {
    ecmaVersion: foxkit.base.languageOptions.ecmaVersion
  },
  settings: {
    "import/internal-regex": "^~\\/",
    "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    "import/resolver": {
      node: {
        extensions: [".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx"]
      }
    }
  }
};

/**
 * Allows config files (such as this very file) to default export again
 * @type {import("typescript-eslint").ConfigWithExtends}
 */
const importConfigsCfg = {
  name: "import/configs-may-default-export",
  files: ["**/*.config.?(m)js"],
  rules: {
    "import/no-default-export": "off"
  }
};

/**
 * @see https://github.com/foxkit-js/eslint-config-foxkit/ for more information
 */
export default tsEslint.config([
  { ignores: ["dist/**"] },
  foxkit.base,
  foxkit.typescript,
  foxkit.configureTS({ tsconfigRootDir: import.meta.dirname }),
  {
    // TEMP: disable rule that'll be gone with next version of my lint config
    //       because omg this is annoying, I am not dealing with that lol
    files: foxkit.typescript.files,
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off"
    }
  },
  importCfg,
  importConfigsCfg,
  prettierCfg
]);
