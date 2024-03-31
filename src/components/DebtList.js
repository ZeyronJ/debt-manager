import { FlatList } from 'react-native';
import DebtItem from './DebtItem';

const DebtList = ({ debts, deleteDebt }) => {
  const renderDebt = ({ item }) => {
    // OBLIGATORIO EL PARAMETRO CON NOMBRE ITEM
    return <DebtItem debt={item} deleteDebt={deleteDebt} />;
  };
  return (
    <FlatList
      className='w-full mt-3'
      data={debts}
      renderItem={renderDebt}
      keyExtractor={(debt) => debt.id}
    />
  );
};

export default DebtList;
