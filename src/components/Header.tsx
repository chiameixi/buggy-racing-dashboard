import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const imgLogo = "/buggy.svg";

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        {/* Menu Toggle Button */}
        <button 
          className="header-menu-button"
          onClick={onToggleSidebar}
          aria-label="Toggle control panel"
          title="Toggle control panel"
        >
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>

        {/* Title */}
        
        <h1 className="header-title">Buggy Racing Dashboard</h1>
        {/* <img src={imgLogo} alt="Buggy Logo" className="header-logo"/> */}
        

        {/* Links Section */}
        <div className="header-links">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            <span className="link-text">github</span>
            <img src="../../icons/GitHub.png" alt = "github" className = "link-icon"/>
          </a>
          <a 
            href="https://github.com/buggy-racing/dashboard"
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            <span className="link-text">about</span>
            <img src="/buggy.svg" alt = "link" className = "link-icon"/>
          </a>
        </div>
      </div>
    </header>
  );
}
