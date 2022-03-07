import {useEffect, useState} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';


import DeleteIcon from '@mui/icons-material/Delete';
import numeral from 'numeral';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';


import Chart from "../chart/chart";


import styles from './list-table.module.css';

import ListTableHead from '../list-table-head/list-table-head';

import {getComparator, headCells, processTableData} from './table-assets';
import ListUpdateProgress from "../list-update-progress/list-update-progress";
import {useQuery, NetworkStatus, useReactiveVar} from "@apollo/client";
import GET_USER_LIST_DATA from "../../gql/queries/get-user-list-data";

import ShareIcon from "@mui/icons-material/Share";
import {Chip} from "@mui/material";
import Add from "@mui/icons-material/Add";
import Modal from "../modal/modal";
import Share from "../share/share";

import DeleteSymbolDialog from "../delete-symbol-dialog/delete-symbol-dialog";
import AddNewSymbol from "../add-new-symbol/add-new-symbol";
import config from "../../config";
import BasicSpinner from "../basic-spinner/basic-spinner";
import authStore from "../../stores/auth-store";


dayjs.extend(relativeTime);

function ListTable({selectedListId}) {

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('symbol');

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const store = useReactiveVar(authStore);


    const [isSymbolModalOpen, setSymbolModalOpen] = useState(false);
    const [isSymbolDialogOpen, setSymbolDialogOpen] = useState(false);

    const [isShareModalOpen, setShareModalOpen] = useState(false);

    const [lastFetchTime, setLastFetchTime] = useState(null);

    const [symbolToDelete, setSymbolToDelete] = useState({id: null, name: null});

    const handleSymbolDelete = (id, name) => {
        setSymbolToDelete({id: id, name: name});
        setSymbolDialogOpen(true);
    }

    const {
        loading: getUserListDataLoading,
        error: getUserListDataError,
        data: getUserListData,
        refetch: getUserListDataRefetch,
        networkStatus: getUserListDataNetworkStatus
    } = useQuery(GET_USER_LIST_DATA, {
        pollInterval: config.listPollInterval,
        variables: {input: {listId: selectedListId}},
        notifyOnNetworkStatusChange: true,
        onCompleted: () => setLastFetchTime(Date.now())
    });

    const [tableData, setTableData] = useState({
        listId: null,
        listName: null,
        isSocial: null,
        listShareId: null,
        symbolsData: []
    });

    useEffect(() => {

        if (getUserListData && getUserListData.getUserListData.result) {

            const data = getUserListData.getUserListData;

            setTableData({
                listId: data.listId,
                listName: data.listName,
                isSocial: data.isSocial,
                listShareId: data.listShareId,
                symbolsData: data.symbolsData
            });

        }

    }, [getUserListData]);


    if (!tableData.listId
        || getUserListDataNetworkStatus === NetworkStatus.loading
        || (getUserListDataLoading && getUserListDataNetworkStatus !== NetworkStatus.poll)) {
        return (
            <div className={styles.table_loading_spinner}>
                <BasicSpinner/>
            </div>
        )
    }

    const rows = processTableData(tableData.symbolsData);

    const rowsSorted = rows.slice(0, rows.length - 1).sort(getComparator(order, orderBy));
    rowsSorted.push(rows[rows.length - 1]);

    const handleAddNewSymbolDone = () => {

        setSymbolModalOpen(false);

        (async () => {
            await getUserListDataRefetch();
        })();

    }

    const deleteSymbol = (id) => {

        let symbolIdx = tableData.symbolsData.findIndex(symbol => symbol.symbolId === id);

        if (symbolIdx !== -1) {
            tableData.symbolsData.splice(symbolIdx, 1);
        }

    }


    return (
        <>

            <div className={styles.table_header}>
                <div className={styles.table_header_name}>
                    {tableData.listName}
                    <span className={styles.share} onClick={() => setShareModalOpen(true)}><ShareIcon/></span>
                </div>

                {(tableData.symbolsData.length < config.maxSymbols && !tableData.isSocial) &&
                    <div className={styles.add_symbol}>
                        <Chip onClick={() => setSymbolModalOpen(true)} label="Add new symbol" variant="outlined"
                              icon={<Add/>} clickable/>
                    </div>
                }

            </div>

            <ListUpdateProgress status={getUserListDataNetworkStatus === NetworkStatus.poll}/>

            {rows.length > 1 &&
                <>
                    <Table size={'medium'}>
                        <ListTableHead
                            headCells={headCells}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>

                            {rowsSorted.map((row, idx) => {

                                let {symbol, symbolId, name, sharesAmount, buyPrice, price, changePrc, change, dayGain, gainPrc, gain, value} = row;

                                let highlight1 = changePrc < 0 ? styles.color_red : styles.color_green;
                                let highlight2 = change < 0 ? styles.color_red : styles.color_green;
                                let highlight3 = dayGain < 0 ? styles.color_red : styles.color_green;
                                let highlight4 = gainPrc < 0 ? styles.color_red : styles.color_green;
                                let highlight5 = gain < 0 ? styles.color_red : styles.color_green;

                                let textBold = idx === rowsSorted.length - 1 ? styles.text_bold : null;


                                let deleteIcon = null;
                                let chart = null;

                                dayGain = numeral(dayGain).format('0,0.00');
                                gainPrc = numeral(gainPrc).format('0,0.00%');
                                gain = numeral(gain).format('0,0.00');
                                value = numeral(value).format('0,0.00');

                                if (idx !== rowsSorted.length - 1) {
                                    buyPrice = numeral(buyPrice).format('0,0.00');
                                    sharesAmount = numeral(sharesAmount).format('0,0');
                                    changePrc = numeral(changePrc).format('0,0.00%');
                                    change = numeral(change).format('0,0.00');
                                    price = numeral(price).format('0,0.00');
                                    deleteIcon = !tableData.isSocial ? <DeleteIcon onClick={() => handleSymbolDelete(symbolId, symbol)} className={styles.delete_icon}/> : null;
                                    chart = <Chart candles={row.candles} trend={change >= 0}/>
                                }

                                return (
                                    <TableRow
                                        hover
                                        key={symbolId}
                                    >

                                        <TableCell
                                            className={styles.table_row}
                                            component="td"
                                            scope="row"
                                            padding="none"
                                        >
                                            <div className={styles.table_name}>
                                                <div className={styles.table_name_symbol}>{symbol}</div>
                                                <div className={styles.table_name_name}>{name}</div>
                                            </div>

                                        </TableCell>

                                        <TableCell className={styles.table_row} padding="none"
                                                   align="right">
                                            <div className={styles.table_chart}>{chart}</div>
                                        </TableCell>

                                        <TableCell className={styles.table_row} padding="none"
                                                   align="right">
                                            <div className={styles.table_shares}>
                                                <div className={styles.table_shares_price}>{sharesAmount}</div>
                                                <div className={styles.table_shares_amount}>{buyPrice}</div>
                                            </div>
                                        </TableCell>

                                        <TableCell className={styles.table_row} padding="none"
                                                   align="right">{price}</TableCell>
                                        <TableCell padding="none" align="right">
                                            <div className={styles.table_change}>
                                                <div className={`${styles.table_change_prc} ${highlight1}`}>{changePrc}</div>
                                                <div className={`${styles.table_change_abs} ${highlight2}`}>{change}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className={styles.table_row} padding="none"
                                                   align="right"><span className={`${highlight3} ${textBold}`}>{dayGain}</span></TableCell>
                                        <TableCell className={styles.table_row} padding="none" align="right">
                                            <div className={styles.table_gain}>
                                                <div className={`${styles.table_gain_prc} ${highlight4} ${textBold}`}>{gainPrc}</div>
                                                <div className={`${styles.table_gain_abs} ${highlight5} ${textBold}`}>{gain}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`${styles.table_row} ${textBold}`} padding="none"
                                                   align="right">{value}</TableCell>
                                        <TableCell className={`${styles.table_row} ${styles.table_row_delete}`} padding="none"
                                                   align="right">{deleteIcon}</TableCell>
                                    </TableRow>
                                );
                            })}

                        </TableBody>
                    </Table>

                    {lastFetchTime !== null &&
                        <div className={styles.table_info}>Last update:
                            {dayjs(lastFetchTime).format('dddd, MMMM D, YYYY HH:mm:ss')}
                        </div>
                    }

                </>
            }


            <Modal isOpen={isShareModalOpen}
                   onModalClose={() => setShareModalOpen(false)}
                   Comp={Share}
                   compProps={{'listShareUrl': `${config.shareUrl}${tableData.listShareId}`}}
            />

            <Modal isOpen={isSymbolModalOpen}
                   onModalClose={() => setSymbolModalOpen(false)}
                   Comp={AddNewSymbol}
                   compProps={{'selectedListId': selectedListId, 'handleAddNewSymbolDone': handleAddNewSymbolDone}}
            />

            <DeleteSymbolDialog isOpen={isSymbolDialogOpen}
                                listId={selectedListId}
                                symbolId={symbolToDelete.id}
                                symbolName={symbolToDelete.name}
                                deleteSymbol={deleteSymbol}
                                onDialogClose={() => {
                                    setSymbolDialogOpen(false);
                                }}
                                confirmText="DELETE"
                                cancelText="CANCEL"
                                refetch={getUserListDataRefetch}
            />

        </>

    );
}

export default ListTable;