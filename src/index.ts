import { Canister, query, text, update, Record, Vec, Void } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define the Medicine type
type Medicine = {
    id: string;
    name: string;
    quantity: string;
    expirationDate: string;
};

// Initialize an array to store medicines
let medicines: Medicine[] = [];

export default Canister({
    // Query to get information about a specific medicine
    getMedicineInfo: query([text], Vec(Record({
        "id": text,
        "name": text,
        "quantity": text,
        "expirationDate": text
    })), (medicineName) => {
        // Find the medicine with the given name
        const medicine = medicines.find((med) => med.name === medicineName);
        // Return the medicine if found, else return an empty array
        return medicine ? [medicine] : [];
    }),

    // Update function to add a new medicine or update an existing one
    addMedicine: update([text, text, text], Void, (name, quantity, expirationDate) => {
        // Check if the medicine already exists
        const existingMedicine = medicines.find((med) => med.name === name && med.expirationDate === expirationDate);

        // If the medicine exists, update its quantity
        if (existingMedicine) {
            // Use parseFloat instead of parseInt to handle non-integer quantities
            existingMedicine.quantity = (parseFloat(existingMedicine.quantity) + parseFloat(quantity)).toString();
            console.log(`Updated quantity for existing medicine (${name}, ${expirationDate}) to ${existingMedicine.quantity}`);
        } else {
            // If the medicine doesn't exist, create a new one
            const newMedicine: Medicine = { id: uuidv4(), name, quantity, expirationDate };
            medicines.push(newMedicine);
            console.log('Added new medicine:', newMedicine);
        }
    }),

    // Query to get all medicines
    getAllMedicines: query([], Vec(Record({
        "id": text,
        "name": text,
        "quantity": text,
        "expirationDate": text
    })), () => medicines),

    // Update function to update the quantity of a medicine
    updateMedicineQuantity: update([text, text, text], Void, (name, soldQuantity, expirationDate) => {
        // Find the medicine with the given name and expiration date
        const medicine = medicines.find((med) => med.name === name && med.expirationDate === expirationDate);
      
        // If the medicine is found, update its quantity
        if (medicine) {
          const currentQuantity = parseFloat(medicine.quantity);
          const soldQuantityFloat = parseFloat(soldQuantity);
      
          // Check if the current quantity is greater than or equal to the sold quantity
          if (currentQuantity >= soldQuantityFloat) {
            // Update the quantity of the medicine
            medicine.quantity = (currentQuantity - soldQuantityFloat).toString();
            console.log(`Updated quantity for ${name} by selling ${soldQuantity}. Remaining quantity: ${medicine.quantity}`);
            
            // If the quantity becomes 0, remove the medicine
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
      

    // Update function to remove expired medicines
    removeExpiredMedicines: update([], Void, () => {
        // Filter out medicines that have expired
        medicines = medicines.filter((med) => new Date(med.expirationDate) > new Date());
        console.log('Removed expired medicines');
    })
});
