import {
  permanentRedirect,
} from 'next/navigation';

export default function IjebuOdeHostelPage() {
  permanentRedirect(
    '/hostel?keyword=Ijebu-Ode'
  );
}