import type {SqlQuery} from '.';

export function sqlBuilder(initial: SqlQuery): {
    add: (fragment: SqlQuery) => void
    build: () => SqlQuery
} {

    let text = initial.text.trim();
    const values = [...initial.values];

    const add = (fragment: SqlQuery): void => {

        const offset = values.length;

        // Adjust placeholder numbers in fragment.text
        const adjustedText = fragment.text.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + offset}`);

        text += `\n${adjustedText}`;
        values.push(...fragment.values);

    };

    const build = (): SqlQuery => ({text, values});

    return {add, build};

}
