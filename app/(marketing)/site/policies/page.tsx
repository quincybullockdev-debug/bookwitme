import { useBusiness } from "@/lib/business-context";

export default function PoliciesPage() {
  const business = useBusiness();
  return (
    <div className="px-4 py-16 md:py-24 max-w-2xl md:max-w-3xl mx-auto">
      {/* Page heading */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12">Policies</h1>

      {/* Each policy is its own labeled section — simple heading + paragraph pattern repeated 7 times */}
      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Cancellation Policy
        </h2>
        <p className="md:text-lg">
          We require at least 24 hours notice to cancel or reschedule an
          appointment. Cancellations made with less notice may be subject to a
          fee.
        </p>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          No-Show Policy
        </h2>
        <p className="md:text-lg">
          Clients who miss an appointment without notice may be charged a
          no-show fee and could be required to pay a deposit for future
          bookings.
        </p>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Late Arrival Policy
        </h2>
        <p className="md:text-lg">
          Please arrive on time for your appointment. Arriving more than 15
          minutes late may result in a shortened service or the need to
          reschedule.
        </p>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Deposit & Payment Policy
        </h2>
        <p className="md:text-lg">
          A deposit may be required to secure your appointment. Deposits are
          applied toward the total cost of your service and are non-refundable
          in the event of a no-show.
        </p>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Refund Policy
        </h2>
        <p className="md:text-lg">
          Services rendered are non-refundable. If you're unsatisfied with your
          service, please contact us within 48 hours so we can make it right.
        </p>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Right to Refuse Service
        </h2>
        <p className="md:text-lg">
          We reserve the right to refuse service to anyone for any reason,
          including but not limited to inappropriate behavior or health and
          safety concerns.
        </p>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Privacy Policy
        </h2>
        <p className="md:text-lg">
          We collect your name, email, and phone number solely to manage your
          bookings and send appointment reminders. We do not sell or share your
          information with third parties.
        </p>
      </section>
    </div>
  );
}
