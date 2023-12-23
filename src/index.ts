import { Canister, query, text, update, Record, Vec, Void } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Medicine = {
    id: string;
    name: string;
    quantity: string;
    expirationDate: string;
};

let medicines: Medicine[] = [];

export default Canister({
    getMedicineInfo: query([text], Vec(Record({
        "id": text,
        "name": text,
        "quantity": text,
        "expirationDate": text
    })), (medicineName) => {
        const medicine = medicines.find((med) => med.name === medicineName);
        return medicine ? [medicine] : [];
    }),

    addMedicine: update([text, text, text], Void, (name, quantity, expirationDate) => {
        const existingMedicine = medicines.find((med) => med.name === name && med.expirationDate === expirationDate);

        if (existingMedicine) {
            existingMedicine.quantity = (parseInt(existingMedicine.quantity) + parseInt(quantity)).toString();
            console.log(`Updated quantity for existing medicine (${name}, ${expirationDate}) to ${existingMedicine.quantity}`);
        } else {
            const newMedicine: Medicine = { id: uuidv4(), name, quantity, expirationDate };
            medicines.push(newMedicine);
            console.log('Added new medicine:', newMedicine);
        }
    }),


    getAllMedicines: query([], Vec(Record({
        "id": text,
        "name": text,
        "quantity": text,
        "expirationDate": text
    })), () => medicines),

    updateMedicineQuantity: update([text, text, text], Void, (name, soldQuantity, expirationDate) => {
        const medicine = medicines.find((med) => med.name === name && med.expirationDate === expirationDate);
      
        if (medicine) {
          const currentQuantity = parseInt(medicine.quantity);
          const soldQuantityInt = parseInt(soldQuantity);
      
          if (currentQuantity >= soldQuantityInt && currentQuantity - soldQuantityInt >= 0) {
            medicine.quantity = (currentQuantity - soldQuantityInt).toString();
            console.log(`Updated quantity for ${name} by selling ${soldQuantity}. Remaining quantity: ${medicine.quantity}`);
            
            if (medicine.quantity === '0') {
              const medicineIndex = medicines.findIndex((med) => med.name === name && med.expirationDate === expirationDate);
              if (medicineIndex !== -1) {
                medicines.splice(medicineIndex, 1);
                console.log(`Medicine ${name} with expiration date ${expirationDate} removed as quantity becomes 0`);
              }
            }
          } else {
            console.log(`Cannot update quantity for ${name} (${expirationDate}). Invalid sold quantity.`);
          }
        } else {
          console.log(`Medicine not found with name ${name} and expiration date ${expirationDate}`);
        }
      }),
      

    removeExpiredMedicines: update([], Void, () => {
        medicines = medicines.filter((med) => new Date(med.expirationDate) > new Date());
        console.log('Removed expired medicines');
    })
});
