import type {SqlQuery} from '.';

export function sql(strings: TemplateStringsArray, ...values: any[]): SqlQuery {

    let text = '';
    const finalValues: any[] = [];
    let paramCounter = 0;

    strings.forEach((chunk, i) => {

        text += chunk;

        if (i < values.length) {

            const value = values[i];

            if (Array.isArray(value)) {

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
