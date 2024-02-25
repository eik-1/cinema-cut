import { useState } from "react"

export default function Box({ children, id }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="box" id={id}>
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    )
}
