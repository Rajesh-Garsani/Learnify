import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, ListGroup, Badge } from 'react-bootstrap';
import axios from '../axiosConfig';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';

const styles = `
  @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
  .typing-dot { animation: blink 1.4s infinite both; height: 6px; width: 6px; background-color: #555; border-radius: 50%; display: inline-block; margin: 0 2px; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
`;

const Typewriter = ({ text, onComplete, stopSignal, onTruncate }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText('');

    const intervalId = setInterval(() => {
      if (stopSignal.current) {
        clearInterval(intervalId);
        onTruncate(text.slice(0, indexRef.current));
        return;
      }
      if (indexRef.current < text.length) {
        indexRef.current++;
        setDisplayedText(text.slice(0, indexRef.current));
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 15);

    return () => clearInterval(intervalId);
  }, [text, stopSignal]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

const ThinkingBubble = () => (
  <div className="d-flex mb-3 justify-content-start fade-in">
    <div
      style={{
        padding: '12px 16px', borderRadius: '12px',
        backgroundColor: '#fff', border: '1px solid #eee',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', minWidth: '50px'
      }}
    >
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
    </div>
  </div>
);

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 350, height: 500 });
  const [isResizing, setIsResizing] = useState(false);

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything or highlight text to explain.' }
  ]);
  const [historyList, setHistoryList] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const stopSignalRef = useRef(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) setHistoryList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const newHistoryItem = {
      id: currentSessionId,
      timestamp: new Date().toLocaleString(),
      preview: messages[1]?.text.substring(0, 30) + '...' || 'New Chat',
      messages: messages
    };
    setHistoryList(prev => {
      const filtered = prev.filter(item => item.id !== currentSessionId);
      const updated = [newHistoryItem, ...filtered];
      localStorage.setItem('chatHistory', JSON.stringify(updated));
      return updated;
    });
  }, [messages, currentSessionId]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      setWindowSize(prev => ({
        width: Math.max(300, prev.width - e.movementX),
        height: Math.max(400, prev.height + e.movementY)
      }));
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startNewChat = () => {
    setMessages([{ sender: 'bot', text: 'Hi! Ask me anything or highlight text to explain.' }]);
    setCurrentSessionId(Date.now());
    setShowHistory(false);
    setLoading(false);
    stopSignalRef.current = false;
  };

  const loadChat = (session) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistory(false);
    setLoading(false);
    stopSignalRef.current = false;
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem('chatHistory', JSON.stringify(updated));
    if (id === currentSessionId) startNewChat();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    processUserMessage(txt);
  };

  const handleStop = () => {
    stopSignalRef.current = true;
  };

  const handleTruncate = (partialText) => {
    setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = partialText + " ... [Stopped]";
        return newMsgs;
    });
    setLoading(false);
    stopSignalRef.current = false;
  };

  const handleComplete = () => {
      setLoading(false);
      stopSignalRef.current = false;
  };

  const handleExplainClick = () => {
    setShowPopup(false);
    setIsOpen(true);
    processUserMessage(`Explain this: "${selectedText}"`);
  };

  const processUserMessage = async (userText) => {
    stopSignalRef.current = false;

    // BUG 1 FIX: Create historyContext based strictly on OLD messages to prevent
    // duplicating the new userText in the payload array
    const historyContext = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      text: msg.text
    }));

    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/explain/', {
        text: userText,
        history: historyContext
      });

      setMessages(prev => [...prev, { sender: 'bot', text: res.data.explanation }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't reach the AI server." }]);
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, showHistory, loading]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (text.length > 2 && !isOpen) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPopupPos({ x: rect.left + window.scrollX + rect.width / 2, y: rect.top + window.scrollY - 40 });
        setSelectedText(text);
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [isOpen]);

  return (
    <>
      <style>{styles}</style>
      {showPopup && (
        <div
          style={{
            position: 'absolute', top: popupPos.y, left: popupPos.x, transform: 'translateX(-50%)',
            zIndex: 9999, backgroundColor: '#222', color: '#fff', padding: '6px 14px',
            borderRadius: '20px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
          }}
          onMouseDown={(e) => { e.preventDefault(); handleExplainClick(); }}
        >
          <i className="bi bi-stars text-warning"></i> Explain
        </div>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', width: '50px', height: '50px',
          backgroundColor: isOpen ? '#6e292e' : '#20355c',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '28px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 10000, transition: 'all 0.3s'
        }}
      >
        <i className={`bi ${isOpen ? 'bi-x' : 'bi-chat-dots-fill'}`}></i>
      </div>

      {isOpen && (
        <Card
          className="shadow-lg border-0"
          style={{
            position: 'fixed',
            bottom: isFullScreen ? '0' : '100px',
            right: isFullScreen ? '0' : '30px',
            width: isFullScreen ? '100vw' : `${windowSize.width}px`,
            height: isFullScreen ? '100vh' : `${windowSize.height}px`,
            maxHeight: isFullScreen ? '100vh' : '80vh',
            maxWidth: isFullScreen ? '100vw' : '90vw',
            zIndex: 10000,
            display: 'flex', flexDirection: 'column',
            borderRadius: isFullScreen ? '0' : '15px', overflow: 'hidden',
            transition: isResizing ? 'none' : 'width 0.2s, height 0.2s, bottom 0.2s, right 0.2s'
          }}
        >
          <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center cursor-move">
            <div className="d-flex align-items-center">
              <Button variant="link" className="text-white p-0 me-3" onClick={() => setShowHistory(!showHistory)} title="History">
                <i className={`bi ${showHistory ? 'bi-chevron-left' : 'bi-clock-history'} fs-5`}></i>
              </Button>
              <h6 className="mb-0 fw-bold"><i className="bi bi-robot me-2"></i>AI Tutor</h6>
            </div>
            <div>
              <Button variant="link" className="text-white p-0 me-3" onClick={() => setIsFullScreen(!isFullScreen)} title="Fullscreen">
                <i className={`bi ${isFullScreen ? 'bi-box-arrow-in-down-left' : 'bi-arrows-fullscreen'}`}></i>
              </Button>
              <Button variant="link" className="text-white p-0" onClick={startNewChat} title="New Chat">
                <i className="bi bi-pencil-square"></i>
              </Button>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: '100%',
                backgroundColor: '#fff', zIndex: 20,
                transform: showHistory ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease', overflowY: 'auto'
              }}
            >
              <div className="p-3 border-bottom bg-light d-flex justify-content-between">
                <strong>Previous Chats</strong>
                <Badge bg="secondary">{historyList.length}</Badge>
              </div>
              <ListGroup variant="flush">
                {historyList.length === 0 && <div className="p-4 text-center text-muted">No history yet.</div>}
                {historyList.map(session => (
                  <ListGroup.Item
                    key={session.id} action onClick={() => loadChat(session)}
                    className={`d-flex justify-content-between align-items-center ${currentSessionId === session.id ? 'bg-light' : ''}`}
                  >
                    <div className="text-truncate" style={{maxWidth: '85%'}}>
                      <div className="fw-bold small">{session.preview}</div>
                      <small className="text-muted" style={{fontSize: '10px'}}>{session.timestamp}</small>
                    </div>
                    <i className="bi bi-trash text-danger cursor-pointer" onClick={(e) => deleteChat(e, session.id)}></i>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>

            <div style={{ height: '100%', overflowY: 'auto', padding: '15px', backgroundColor: '#f8f9fa' }}>
              {messages.map((msg, idx) => {
                const isBot = msg.sender === 'bot';
                const isLast = idx === messages.length - 1;
                return (
                  <div key={idx} className={`d-flex mb-3 ${isBot ? 'justify-content-start' : 'justify-content-end'}`}>
                    <div
                      style={{
                        maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem',
                        backgroundColor: isBot ? '#fff' : '#0d6efd', color: isBot ? '#333' : '#fff',
                        boxShadow: isBot ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', border: isBot ? '1px solid #eee' : 'none'
                      }}
                    >
                      {isBot && isLast && loading ? (
                        <Typewriter
                          text={msg.text}
                          onComplete={handleComplete}
                          stopSignal={stopSignalRef}
                          onTruncate={handleTruncate}
                        />
                      ) : (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && messages[messages.length - 1].sender === 'user' && <ThinkingBubble />}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="p-3 bg-white border-top">
            <Form onSubmit={handleSend} className="d-flex">
              <Form.Control
                type="text" placeholder="Ask me anything..." value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ borderRadius: '20px', fontSize: '0.9rem', paddingLeft: '15px' }} autoFocus
                disabled={loading}
              />
              {loading ? (
                <Button variant="danger" className="ms-2 rounded-circle shadow-sm" onClick={handleStop} title="Pause/Stop">
                  <i className="bi bi-pause-fill"></i>
                </Button>
              ) : (
                <Button type="submit" variant="primary" className="ms-2 rounded-circle shadow-sm">
                  <i className="bi bi-send-fill"></i>
                </Button>
              )}
            </Form>
          </div>
          {!isFullScreen && (
            <div
              onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
              style={{
                position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px',
                cursor: 'nwse-resize', zIndex: 30,
                background: 'linear-gradient(135deg, transparent 50%, #ccc 50%)', borderBottomRightRadius: '15px'
              }}
            />
          )}
        </Card>
      )}
    </>
  );
};

export default AIChatbot;