import { useCallback, useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10);
  const [isFetching, setIsFetching] = useState(false)
  const [totalPage, setTotalPage] = useState(0)
  const [data, setData] = useState([]);

  const endOfPageRef = useRef(null)

  const getPessagers = useCallback(async()=>{
    const url = new URL("https://api.instantwebtools.net/v1/passenger")
    url.searchParams.append("page", page.toString())
    url.searchParams.append("size", size.toString())
    try {
      setIsFetching(true)
      const response = await fetch(url.href)
      const { data : responseData , totalPages } = await response.json()
      setIsFetching(false)
      const newData = []
      responseData.forEach((d) => {
        newData.push(Object.keys(d).
          filter((key) => !key.includes('airline')).
          reduce((cur, key) => { return Object.assign(cur, { [key]: d[key] })}, {})
      )})

      setTotalPage(totalPages)
      setData([...data, ...newData])

    }catch(err){
      console.log(err)
    }
  },[page,size])

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observer)=>{
      entries.forEach(async(entrie, observer) => {
        if(entrie.isIntersecting){
          console.log("is Intersection")

          if(!isFetching) {
              console.log("is Fetching")
              await getPessagers()
              setPage(page+1)
          }
        }
      })
    },{
      root: null,
      rootMargin: "10px",
      threshold: 1.0,
    })
    observer.observe(endOfPageRef.current)
    return () => {
      observer.disconnect()
    }
  }, [isFetching])
  
  return (
    <div className="App">
      {data.map((d, idx) => (
        <div style={{
          padding: "20px"
        }} key={d._id}>
          <span>{idx + 1}</span>
          <span>{d.name}</span>
          <span>{d.trips}</span>
        </div>
      ))}
      <div style={{
        marginTop: "400px"
      }} ref={endOfPageRef}/>
    </div>
  )
}

export default App
