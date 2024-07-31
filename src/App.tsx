import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { EditIcon, CheckIcon, DeleteIcon } from './Icons';

interface TableRow {
    id: number;
    cells: boolean[];
}

const App: React.FC = () => {
    const [columns, setColumns] = useState<number[]>([]);
    const [rows, setRows] = useState<TableRow[]>([]);
    const [orderNames, setOrderNames] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<{ [key: number]: boolean }>({});
    const [showModal, setShowModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);
    const [maxOrderNumber, setMaxOrderNumber] = useState<number>(1);

    // Мемоизация функции generateTable
    const generateTable = useCallback(async () => {
        const columns = await generateColumns();
        const rows = await generateRows(columns.length);
        setColumns(columns);
        setRows(rows);
        const initialOrderNames = rows.map((_, index) => `Заказ ${index + 1}`);
        setOrderNames(initialOrderNames);
        setMaxOrderNumber(rows.length ? rows.length : 1);
    }, []);

    // Вызов функции generateTable при монтировании компонента
    useEffect(() => {
        generateTable();
    }, [generateTable]);

    const generateColumns = (): Promise<number[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const colCount = Math.floor(Math.random() * 100) + 2;
                resolve(Array.from({ length: colCount }, (_, i) => i + 1));
            }, 1500);
        });
    };

    const generateRows = (colCount: number): Promise<TableRow[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const rowCount = Math.floor(Math.random() * 100) + 2;
                const rows = Array.from({ length: rowCount }, (_, rowIndex) => ({
                    id: rowIndex,
                    cells: Array.from({ length: colCount }, () => Math.random() >= 0.5),
                }));
                resolve(rows);
            }, 1500);
        });
    };

    const addRow = () => {
        const newRow = {
            id: rows.length,
            cells: Array.from({ length: columns.length }, () => Math.random() >= 0.5),
        };
        setRows([...rows, newRow]);
        setOrderNames([...orderNames, `Заказ ${maxOrderNumber + 1}`]);
        setMaxOrderNumber(maxOrderNumber + 1);
    };

    const toggleCellValue = (rowIndex: number, colIndex: number) => {
        if (!isEditing[rowIndex]) return;
        const newRows = rows.map((row) =>
            row.id === rowIndex ? {
                ...row,
                cells: row.cells.map((cell, cIndex) => (cIndex === colIndex ? !cell : cell))
            } : row
        );
        setRows(newRows);
    };

    const confirmDeleteRow = (index: number) => {
        setRowToDelete(index);
        setShowModal(true);
    };

    const deleteRow = () => {
        if (rowToDelete !== null) {
            const deletedRow = rows[rowToDelete];
            const newRows = rows.filter(row => row.id !== rowToDelete).map((row, index) => ({ ...row, id: index }));
            const newOrderNames = orderNames.filter((_, index) => index !== rowToDelete);

            setRows(newRows);
            setOrderNames(newOrderNames);
            setShowModal(false);
            setRowToDelete(null);

            // Update maxOrderNumber if the deleted row had the highest number
            if (deletedRow.id === maxOrderNumber - 1) {
                setMaxOrderNumber(Math.max(...newRows.map(row => row.id), 0) + 1);
            }

            // Update isEditing state
            const newEditingState = Object.keys(isEditing)
                .filter(key => parseInt(key, 10) !== rowToDelete)
                .reduce((acc, key) => {
                    const index = parseInt(key, 10);
                    acc[index > rowToDelete ? index - 1 : index] = isEditing[index];
                    return acc;
                }, {} as { [key: number]: boolean });
            setIsEditing(newEditingState);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setRowToDelete(null);
    };

    const toggleEditing = (rowIndex: number) => {
        setIsEditing(prev => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
    };

    return (
        <div className="container">
            <h1 className="center">Таблица заказов</h1>
            <button onClick={addRow}>Добавить строку</button>
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        {columns.map((col) => (
                            <th key={col} className="vertical-header">Обработка {col}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td className={'first-cell'}>{orderNames[row.id]}</td>
                            {row.cells.map((cell, colIndex) => (
                                <td
                                    key={colIndex}
                                    style={{
                                        backgroundColor: cell ? 'lightgreen' : 'lightcoral',
                                        cursor: isEditing[row.id] ? 'pointer' : 'default',
                                    }}
                                    onClick={() => toggleCellValue(row.id, colIndex)}
                                >
                                    {/*{cell.toString()}*/}
                                </td>
                            ))}
                            <td className={'last-cell'}>
                                <button
                                    className="icon-button"
                                    onClick={() => toggleEditing(row.id)}
                                    style={{
                                        backgroundColor: isEditing[row.id] ? 'lightgreen' : '',
                                        border: 'none',
                                        padding: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {isEditing[row.id] ? <CheckIcon /> : <EditIcon />}
                                </button>
                                <button
                                    onClick={() => confirmDeleteRow(row.id)}
                                    style={{
                                        border: 'none',
                                        padding: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <DeleteIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Вы уверены, что хотите удалить эту строку?</p>
                        <button onClick={deleteRow}>Удалить</button>
                        <button onClick={closeModal}>Отмена</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
