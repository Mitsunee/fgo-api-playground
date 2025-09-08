import { ClassBoardSquareFlag } from "@atlasacademy/api-connector/dist/Schema/ClassBoard";
import type {
  ClassBoard,
  ClassBoardLine
} from "@atlasacademy/api-connector/dist/Schema/ClassBoard";
import type { ItemProcessor } from "./processItemData";
import { convertClassName } from "./classNames";
import { log } from "~/utils/logger";

export function createClassScoreProcessor(itemProcessor: ItemProcessor) {
  const scoreMap: Record<ID, ClassScore> = {};

  function getClassScoreList() {
    return Object.values(scoreMap).sort((a, b) => a.id - b.id);
  }

  function processClassScores(
    niceScoreJP: ClassBoard[],
    niceScoreEN: ClassBoard[]
  ) {
    for (const boardJP of niceScoreJP) {
      const boardEN =
        boardJP.id == 8 // TEMP: Extra 1 is still locked on EN
          ? undefined
          : niceScoreEN.find(board => board.id == boardJP.id);
      const en = Boolean(boardEN);
      const boardClasses = new Set<ServantClass>();

      for (const boardClass of boardJP.classes) {
        boardClasses.add(convertClassName(boardClass.className));
      }

      const score: ClassScore = {
        id: boardJP.id,
        name: boardEN?.name || boardJP.name,
        classes: Array.from(boardClasses),
        nodes: {},
        startNodes: []
      };

      // process squares
      for (const square of boardJP.squares) {
        // skip if blank
        if (square.flags.includes(ClassBoardSquareFlag.BLANK)) continue;
        if (square.flags.includes(ClassBoardSquareFlag.START)) {
          score.startNodes.push(square.id);
        }

        const node: ClassScoreNode = {
          id: square.id,
          qp: 0,
          items: [],
          next: []
        };

        // add detail if available
        const squareEN = boardEN?.squares.find(
          squareEN => squareEN.id == square.id
        );
        const detail =
          squareEN?.targetSkill?.detail || squareEN?.targetCommandSpell?.detail;
        if (detail) node.detail = detail;

        // process items
        for (const itemAmount of square.items) {
          // why is QP an item here?
          if (itemAmount.item.id == 1) {
            node.qp += itemAmount.amount;
            continue;
          }

          // add to node
          node.items.push([itemAmount.item.id, itemAmount.amount]);

          // if item not previously processed do that now and push it to list
          itemProcessor.registerItem(itemAmount.item, en);
        }

        // process lock items
        if (square.lock) {
          for (const itemAmount of square.lock.items) {
            // why is QP an item here?
            if (itemAmount.item.id == 1) {
              node.qp += itemAmount.amount;
              continue;
            }

            // add to node
            node.items.push([itemAmount.item.id, itemAmount.amount]);

            // if item not previously processed do that now and push it to list
            itemProcessor.registerItem(itemAmount.item, en);
          }
        }

        // mark EN and if available
        if (boardEN) score.en = true;

        // register node in map
        score.nodes[square.id] = node;
      }

      // process lines
      const mergedLines = new Set<ClassBoardLine>();
      for (const line of boardJP.lines) {
        if (mergedLines.has(line)) continue;
        const prev = score.nodes[line.prevSquareId];
        let { nextSquareId } = line;
        let next: ClassScoreNode | undefined = score.nodes[nextSquareId];

        if (!next) {
          log.debug(
            `Attempting to bridge to next known node from line ${line.prevSquareId}=>${line.nextSquareId} on board ${score.name}`
          );
        }

        while (!next) {
          const merge = boardJP.lines.find(
            candidate => candidate.prevSquareId == nextSquareId
          );
          if (!merge) {
            log.warn(
              `No suitable merge candidate found for line ${line.prevSquareId}=>${line.nextSquareId}`
            );
            break;
          }

          log.debug(
            `Merging with line ${merge.prevSquareId}=>${merge.nextSquareId}`
          );
          next = score.nodes[merge.nextSquareId];
          nextSquareId = merge.nextSquareId;
          mergedLines.add(merge);
        }

        if (!next) {
          log.error(
            `Missing next node ${line.nextSquareId} (or further connection) for line ${line.prevSquareId}=>${line.nextSquareId}`
          );
          continue;
        }

        if (!prev) {
          log.warn(
            `Missing prev node ${line.prevSquareId} for line ${line.prevSquareId}=>${line.nextSquareId}`
          );
          continue;
        }
        prev.next.push(next.id);
      }

      scoreMap[score.id] = score;
    }
  }

  return { getClassScoreList, processClassScores };
}
