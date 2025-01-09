import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function InvoiceForm() {
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    address: '',
  });
  
  const [items, setItems] = useState([{
    description: '',
    quantity: 1,
    price: 0,
  }]);

  const [preview, setPreview] = useState(false);
  const invoiceRef = useRef(null);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * .18;
  };

  const calculateTotal = (subtotal, tax) => {
    return subtotal + tax;
  };

  const handleAddItem = () => {

    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setPreview(true);
  };

  const handleBackToEdit = () => {
    setPreview(false);
  };

  const handleSaveAndDownload = async () => {
    if (!invoiceRef.current) return;

    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal);
      const total = calculateTotal(subtotal, tax);

      const invoiceData = {
        ...customer,
        items,
        subtotal,
        tax,
        total,
      };

      await fetch('https://invoice-generatorbackend.vercel.app/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${customer.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`);

    } catch (error) {
      console.error('Error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const InvoicePreview = () => (
    <div 
      ref={invoiceRef} 
      className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
      style={{ minHeight: '297mm', width: '210mm' }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">From:</h2>
          <p className="text-gray-700">Naman Ahuja</p>
          <p className="text-gray-700"></p>
          <p className="text-gray-700">naman6176@gmail.com</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Bill To:</h2>
          <p className="text-gray-700">{customer.name}</p>
          <p className="text-gray-700">{customer.email}</p>
          <p className="text-gray-700">{customer.address}</p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-right">Quantity</th>
            <th className="py-2 px-4 text-right">Price</th>
            <th className="py-2 px-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-4">{item.description}</td>
              <td className="py-2 px-4 text-right">{item.quantity}</td>
              <td className="py-2 px-4 text-right">${item.price.toFixed(2)}</td>
              <td className="py-2 px-4 text-right">
                ${(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold">Tax (18%):</span>
            <span>${calculateTax(calculateSubtotal()).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-300">
            <span className="font-bold">Total:</span>
            <span className="font-bold">
              ${calculateTotal(
                calculateSubtotal(),
                calculateTax(calculateSubtotal())
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {!preview ? (
        <form onSubmit={handlePreview} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full p-2 border rounded"
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Customer Email"
                className="w-full p-2 border rounded"
                value={customer.email}
                onChange={(e) => setCustomer({...customer, email: e.target.value})}
                required
              />
              <textarea
                placeholder="Customer Address"
                className="w-full p-2 border rounded"
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Items</h2>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Description"
                  className="p-2 border rounded col-span-2"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="p-2 border rounded"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  required
                  min="1"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Price"
                    className="p-2 border rounded flex-grow"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    required
                    min="0"
                    step="0.01"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Preview Invoice
          </button>
        </form>
      ) : (
        <div>
          <div className="mb-4 flex justify-end space-x-4">
            <button
              onClick={handleBackToEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Edit
            </button>
            <button
              onClick={handleSaveAndDownload}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save & Download PDF
            </button>
          </div>
          <InvoicePreview />
        </div>
      )}
    </div>
  );
}

export default InvoiceForm;