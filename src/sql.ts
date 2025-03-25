import type {SqlQuery} from '.';

type RawSql = {
    __raw: true
    text: string
};

export function raw(text: string): RawSql {

    return {__raw: true, text};

}

function isRaw(value: any): value is RawSql {

    // eslint-disable-next-line no-underscore-dangle
    return value && value.__raw === true && typeof value.text === 'string';

}

export function sql(strings: TemplateStringsArray, ...values: any[]): SqlQuery {

    let text = '';
    const finalValues: any[] = [];
    let paramCounter = 0;

    strings.forEach((chunk, i) => {

        text += chunk;

        if (i < values.length) {

            const value = values[i];

            if (isRaw(value)) {

                text += value.text;

            } else if (Array.isArray(value)) {

                if (value.length === 0) {

                    throw new Error('Cannot interpolate empty array into SQL');

                }

                const placeholders = value.map(() => `$${++paramCounter}`);

                text += placeholders.join(', ');
                finalValues.push(...value);

            } else {

                text += `$${++paramCounter}`;
                finalValues.push(value);

            }

        }

    });

    return {text: text.trim(), values: finalValues};

}
