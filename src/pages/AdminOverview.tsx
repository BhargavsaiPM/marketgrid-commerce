import { ShieldAlert, Users, DollarSign, Store } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export default function AdminOverview() {
  const mockActivity = [
    { id: 1, type: 'vendor_signup', title: 'New Vendor Application', desc: 'Apex Gear Co. has applied to join MarketGrid.', time: '10 mins ago', status: 'pending' },
    { id: 2, type: 'dispute', title: 'Dispute Escalated', desc: 'Order #o429 has been escalated by the customer.', time: '2 hours ago', status: 'urgent' },
    { id: 3, type: 'order', title: 'Large Order Processed', desc: 'Lumen Electronics fulfilled a $12,450.00 B2B order.', time: '4 hours ago', status: 'info' },
    { id: 4, type: 'vendor_signup', title: 'New Vendor Application', desc: 'Velvet Threads has applied to join MarketGrid.', time: '1 day ago', status: 'pending' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Platform Overview</h1>
          <p className="text-on-surface-variant">Global metrics and recent platform activity.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total GMV (30d)"
          value="$2.4M"
          icon={<DollarSign size={20} />}
        />
        <MetricCard
          title="Active Vendors"
          value="1,248"
          icon={<Store size={20} />}
        />
        <MetricCard
          title="Pending KYC Reviews"
          value="14"
          icon={<Users size={20} className="text-tertiary" />}
          pulse={true}
        />
        <MetricCard
          title="Open Disputes"
          value="8"
          icon={<ShieldAlert size={20} className="text-error" />}
        />
      </div>

      {/* Activity Feed */}
      <div className="glass-1 rounded-xl border border-outline-variant overflow-hidden flex flex-col">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest/50">
          <h2 className="font-headline font-bold text-lg">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <tbody className="divide-y divide-outline-variant/50">
              {mockActivity.map(activity => (
                <tr key={activity.id} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="p-4 w-12">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'vendor_signup' ? 'bg-secondary/20 text-secondary' :
                      activity.type === 'dispute' ? 'bg-error/20 text-error' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {activity.type === 'vendor_signup' ? <Store size={14} /> :
                       activity.type === 'dispute' ? <ShieldAlert size={14} /> :
                       <DollarSign size={14} />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{activity.title}</div>
                    <div className="text-on-surface-variant text-xs mt-1">{activity.desc}</div>
                  </td>
                  <td className="p-4 text-right text-on-surface-variant text-xs font-mono">
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
