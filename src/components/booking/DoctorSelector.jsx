import { DOCTORS, DEPARTMENTS } from '../../data/sampleData';
import DoctorCard from '../cards/DoctorCard';

export default function DoctorSelector({ dept, selected, onSelect }) {
  const deptDoctors = DOCTORS.filter((d) => d.dept === dept?.id);
  const deptObj     = DEPARTMENTS.find((d) => d.id === dept?.id);

  return (
    <div>
      <h2 className="section-title mb-1">Choose Your Doctor</h2>
      <p className="section-sub mb-7">
        Available doctors in{' '}
        <span className="font-bold" style={{ color: deptObj?.color }}>
          {deptObj?.icon} {dept?.name}
        </span>
      </p>

      <div className="flex flex-col gap-3">
        {deptDoctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            doctor={doc}
            selected={selected?.id === doc.id}
            onClick={() => onSelect(doc)}
          />
        ))}
      </div>
    </div>
  );
}
