import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminDisputes() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mockDisputes = [
    {
      id: 1,
      orderId: 'o429',
      buyer: 'Sarah Jenkins',
      vendor: 'Lumen Electronics',
      issue: 'Item arrived damaged, requesting refund.',
      status: 'Open',
      items: [{ name: 'Aria Wireless Earbuds Pro', price: 89.99, qty: 1 }],
      messages: [
        { sender: 'buyer', text: 'The left earbud casing is cracked out of the box.', time: 'Oct 26, 10:00 AM' },
        { sender: 'vendor', text: 'We apologize. We can offer a replacement if you ship it back.', time: 'Oct 26, 11:30 AM' },
        { sender: 'buyer', text: 'I need them for a trip tomorrow, a replacement will take too long. Can I get a partial refund?', time: 'Oct 26, 12:15 PM' }
      ]
    },
    {
      id: 2,
      orderId: 'o881',
      buyer: 'Mike T.',
      vendor: 'Vertex Sportswear',
      issue: 'Wrong size shipped.',
      status: 'Under Review',
      items: [{ name: 'TrailFlex Running Shoes', price: 74.00, qty: 1 }],
      messages: [
        { sender: 'buyer', text: 'I ordered size 10, received size 9.', time: 'Oct 25, 2:00 PM' }
      ]
    }
  ];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (action: string, orderId: string) => {
    showToast(`${action} processed for Order #${orderId}`);
    setExpandedId(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg shadow-floating border border-secondary"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Dispute Resolution</h1>
          <p className="text-on-surface-variant">Mediate issues between buyers and vendors.</p>
        </div>
      </div>

      <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest/50">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search disputes..."
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <button className="p-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant transition-colors flex items-center justify-center shrink-0">
            <Filter size={16} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container text-on-surface-variant font-mono text-xs uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="p-4 font-medium w-8"></th>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Buyer</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Issue</th>
                <th className="p-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {mockDisputes.map(dispute => (
                <React.Fragment key={dispute.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === dispute.id ? null : dispute.id)}
                    className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-on-surface-variant">
                      {expandedId === dispute.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                    <td className="p-4 font-mono font-bold text-on-surface">#{dispute.orderId}</td>
                    <td className="p-4 text-on-surface-variant">{dispute.buyer}</td>
                    <td className="p-4 text-on-surface-variant">{dispute.vendor}</td>
                    <td className="p-4 text-on-surface truncate max-w-[200px]">{dispute.issue}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                        dispute.status === 'Open' ? 'bg-error/20 text-error' :
                        dispute.status === 'Under Review' ? 'bg-tertiary/20 text-tertiary' :
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {dispute.status}
                      </span>
                    </td>
                  </tr>

                  <AnimatePresence>
                    {expandedId === dispute.id && (
                      <tr className="bg-surface-container-lowest/30">
                        <td colSpan={6} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 border-t border-outline-variant flex flex-col md:flex-row gap-8">
                              {/* Left Col: Details & Actions */}
                              <div className="w-full md:w-1/3 flex flex-col gap-6">
                                <div>
                                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant mb-3">Order Details</h4>
                                  <div className="bg-surface-container rounded-lg p-3 border border-outline-variant">
                                    {dispute.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-start text-sm">
                                        <div>
                                          <div className="font-medium text-on-surface">{item.name}</div>
                                          <div className="text-on-surface-variant text-xs mt-1">Qty: {item.qty}</div>
                                        </div>
                                        <div className="font-mono text-on-surface">${item.price.toFixed(2)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant mb-3">Admin Actions</h4>
                                  <div className="flex flex-col gap-2">
                                    <button
                                      onClick={() => handleAction('Partial Refund Approved', dispute.orderId)}
                                      className="w-full py-2 bg-primary text-on-primary rounded text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                      Approve Partial Refund
                                    </button>
                                    <button
                                      onClick={() => handleAction('Dispute Closed', dispute.orderId)}
                                      className="w-full py-2 bg-transparent border border-outline text-on-surface rounded text-sm font-medium hover:bg-surface-variant transition-colors"
                                    >
                                      Close Dispute
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right Col: Messaging */}
                              <div className="w-full md:w-2/3">
                                <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-on-surface-variant mb-3">Message Thread</h4>
                                <div className="bg-surface-container rounded-lg border border-outline-variant p-4 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                                  {dispute.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.sender === 'buyer' ? 'items-start' : 'items-end'}`}>
                                      <div className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                                        msg.sender === 'buyer' ? 'bg-surface-variant text-on-surface' : 'bg-primary/20 text-primary border border-primary/20'
                                      }`}>
                                        {msg.text}
                                      </div>
                                      <span className="text-[10px] text-on-surface-variant mt-1 px-1 font-mono uppercase">{msg.sender} • {msg.time}</span>
                                    </div>
                                  ))}
                                  <div className="mt-2 flex gap-2">
                                    <input type="text" placeholder="Add admin note..." className="flex-grow bg-surface border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary text-on-surface" />
                                    <button className="px-4 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm font-medium hover:bg-surface-variant">Send</button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
