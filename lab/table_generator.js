document.querySelectorAll('table[data-generate-table]').forEach(table => {
    const [rows, cols] = table.dataset.generateTable.split(',').map(x => parseInt(x, 10));

    table
        .appendChild(document.createElement('thead'))
        .appendChild(document.createElement('tr'))
        .append(...Array.from({ length: cols }, (_, i) => {
            const th = document.createElement('th');
            th.textContent = `Column ${i + 1}`;
            return th;
        }));

    table
        .appendChild(document.createElement('tbody'))
        .append(...Array.from({ length: rows }, (_, row) => {
            const tr = document.createElement('tr');
            tr.append(...Array.from({ length: cols }, (__, col) => {
                const td = document.createElement('td');
                td.textContent = `Cell ${row * cols + col + 1}`;
                return td;
            }));
            return tr;
        }));
});
