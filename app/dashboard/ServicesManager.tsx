// runs in the browser — needed for form state and click handlers
"use client";

import { useState, useEffect } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "./actions";

// takes businessId so it knows whose services to show
export default function ServicesManager({
  businessId,
}: {
  businessId: string;
}) {
  // holds the current list of services, starts empty
  const [services, setServices] = useState<any[]>([]);

  // holds the new-service form's input values
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  // tracks which service (by id) is currently being edited, null = none
  const [editingId, setEditingId] = useState<string | null>(null);

  // holds the edit form's input values, separate from the "add new" form
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // loads the services list once when the component mounts
  useEffect(() => {
    async function loadServices() {
      const data = await getServices(businessId);
      setServices(data);
    }
    loadServices();
  }, [businessId]);

  // clicking "Edit" loads that service's current values into the edit form and marks it as being edited
  function startEdit(service: any) {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(String(service.price));
    setEditDuration(String(service.duration_minutes));
  }

  // saves the edited values, exits edit mode, and refreshes the list
  async function handleUpdate(serviceId: string) {
    await updateService(serviceId, {
      name: editName,
      price: Number(editPrice),
      duration_minutes: Number(editDuration),
    });
    setEditingId(null);
    const data = await getServices(businessId);
    setServices(data);
  }

  // runs when the "add service" form is submitted
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // saves the new service to the DB
    await createService(businessId, name, Number(price), Number(duration));

    // clears the form
    setName("");
    setPrice("");
    setDuration("");

    // re-fetches the list so the new service shows up
    const data = await getServices(businessId);
    setServices(data);
  }

  // deletes a service, then refreshes the list
  async function handleDelete(serviceId: string) {
    await deleteService(serviceId);
    const data = await getServices(businessId);
    setServices(data);
  }

  return (
    <div>
      {/* the add-service form */}
      <form onSubmit={handleCreate}>
        <input
          placeholder="Service name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button type="submit">Add Service</button>
      </form>

      {/* the list of existing services */}
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            {service.name} — ${service.price} — {service.duration_minutes} min
            <button onClick={() => handleDelete(service.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
