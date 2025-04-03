const textGlobals = `Global options:
  -v,--verbose    Enable debug logging
  -h,--help       Print this help text and exit
  -s,--show-all   Always show all runs, even if already possible with current AP`;

const textCalc = `calculate:
  ap-calc [-vs] [--max <num>] [--node <num>] [--target <num>] <current-ap> [<current-timer>]

  Options:
    -m,--max      Override for Max AP (Default: 144)
    -n,--node     Node Cost (shows all possible (future) runs; optional)
    -t,--target   Sets target AP (optional)

  Parameters:
    current-ap    Current amount of AP
    current-timer Timer until next ap such as "1:45" or "145" (optional)`;

const textHelp = `help:
  ap-calc help [-v] [<command>]

  Alias for running the script with --help

  Parameters:
    command       Name of the command to print help for (optional)`;

const textHistory = `history:
  ap-calc history [-vs] <num>

  Show previous calculation results. Up to 5 results are kept in the history, with 1 being the newest and 5 being the oldest.
  Alternatively the value "prev" can be used to retrieve the newest result.`;

const textPrev = `prev:
  ap-calc prev [-vs]

  Alias for running the script as "history prev"`;

export function commandHelp(positionals: string[]) {
  let text = `AP Calculator\n\n${textGlobals}`;
  const param = positionals.find(str => str != "help");

  switch (param) {
    case "calculate":
      text += `\n\n${textCalc}`;
      break;
    case "history":
      text += `\n\n${textHistory}`;
      break;
    case "prev":
      text += `\n\n${textHistory}\n\n${textPrev}`;
      break;
    default:
      text += `\n\n${textCalc}\n\n${textHelp}\n\n${textHistory}\n\n${textPrev}`;
  }

  console.log(text);
}
