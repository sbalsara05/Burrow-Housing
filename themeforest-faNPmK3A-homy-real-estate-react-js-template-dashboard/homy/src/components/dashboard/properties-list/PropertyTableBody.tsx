import { Link } from "react-router-dom";

interface DataType {
   id: number;
   title: string;
   address: string;
   price: number;
   date: string;
   view: number;
   img: string;
   status: string;
   status_bg?: string;
}

const list_data: DataType[] = [
   {
      id: 1,
      title: "Galaxy Flat",
      address: "Mirpur 10, dhaka, BD",
      price: 32800,
      date: "13 Jan, 2023",
      view: 1210,
      img: "/assets/images/dashboard/img_01.jpg",
      status: "Active",
   },
   {
      id: 2,
      title: "White House villa",
      address: "Ranchview, California, USA",
      price: 42130,
      date: "09 Jan, 2023",
      view: 0,
      img: "/assets/images/dashboard/img_02.jpg",
      status: "Pending",
      status_bg: "pending"
   },
   {
      id: 3,
      title: "Luxury villa in Dal lake",
      address: "Muza link road, ca, usa",
      price: 2370,
      date: "17 Oct, 2022",
      view: 0,
      img: "/assets/images/dashboard/img_03.jpg",
      status: "Processing",
      status_bg: "processing",
   },
   {
      id: 4,
      title: "Wooden World",
      address: "Board Baxar, Califronia, USA",
      price: 63300,
      date: "23 Sep, 2022",
      view: 970,
      img: "/assets/images/dashboard/img_04.jpg",
      status: "Active",
   },
   {
      id: 5,
      title: "Orkit Villa",
      address: "Green Road, Uttara, BD",
      price: 72000,
      date: "15 Aug, 2022",
      view: 2320,
      img: "/assets/images/dashboard/img_05.jpg",
      status: "Active",
   },
]

const PropertyTableBody = () => {
   return (
      <tbody className="border-0">
         {list_data.map((item) => (
            <tr key={item.id}>
               <td>
                  <div className="d-lg-flex align-items-center position-relative">
                     <img src={item.img} alt="" className="p-img" />
                     <div className="ps-lg-4 md-pt-10">
                        <Link to="#" className="property-name tran3s color-dark fw-500 fs-20 stretched-link">{item.title}</Link>
                        <div className="address">{item.address}</div>
                        <strong className="price color-dark">${item.price}</strong>
                     </div>
                  </div>
               </td>
               <td>{item.date}</td>
               <td>{item.view}</td>
               <td>
                  <div className={`property-status ${item.status_bg}`}>{item.status}</div>
               </td>
               <td>
                  <div className="action-dots float-end">
                     <button className="action-btn dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <span></span>
                     </button>
                     <ul className="dropdown-menu dropdown-menu-end">
                        <li><Link className="dropdown-item" to="#"><img src="/assets/images/dashboard/icon/icon_18.svg" alt="" className="lazy-img" /> View</Link></li>
                        <li><Link className="dropdown-item" to="#"><img src="/assets/images/dashboard/icon/icon_19.svg" alt="" className="lazy-img" /> Share</Link></li>
                        <li><Link className="dropdown-item" to="#"><img src="/assets/images/dashboard/icon/icon_20.svg" alt="" className="lazy-img" /> Edit</Link></li>
                        <li><Link className="dropdown-item" to="#"><img src="/assets/images/dashboard/icon/icon_21.svg" alt="" className="lazy-img" /> Delete</Link></li>
                     </ul>
                  </div>
               </td>
            </tr>
         ))}
      </tbody>
   )
}

export default PropertyTableBody
