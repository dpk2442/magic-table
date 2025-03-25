import Column from './Column.ts';

export default class Row {
    private row;

    private rowIndex;

    private parsedColumns;

    constructor(
        columns: Array<Column<any>>,
        row: HTMLTableRowElement,
        rowIndex: number,
    ) {
        this.row = row;
        this.rowIndex = rowIndex;
        this.parsedColumns = Array.from(
            row.querySelectorAll('td'),
            (column, columnIndex) =>
                columns[columnIndex].parseCellValue(column.textContent ?? ''),
        );
    }

    get element() {
        return this.row;
    }

    get originalIndex() {
        return this.rowIndex;
    }

    getParsedValue(columnId: number) {
        return this.parsedColumns[columnId];
    }
}
