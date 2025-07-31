"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import {
  Trash2,
  Plus,
  Clock,
  Edit3,
  Check,
  X,
  Target,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Save,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"

interface Actividad {
  id: number
  nombre: string
  horas: number
  horasCompletadas: number
}

interface SemanaData {
  id: string
  fechaInicio: Date
  fechaFin: Date
  actividades: Actividad[]
  completada: boolean
}

export default function AgendaSemanal() {
  const [semanas, setSemanas] = useState<SemanaData[]>([])
  const [semanaActualIndex, setSemanaActualIndex] = useState(0)
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState<number | null>(null)

  const [nuevaActividad, setNuevaActividad] = useState("")
  const [nuevasHoras, setNuevasHoras] = useState("")
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [valorTemporal, setValorTemporal] = useState("")
  const [editandoProgreso, setEditandoProgreso] = useState<number | null>(null)
  const [progresoTemporal, setProgresoTemporal] = useState("")
  const [agregandoHoras, setAgregandoHoras] = useState<number | null>(null)
  const [horasAAgregar, setHorasAAgregar] = useState("")

  // Función para obtener el inicio y fin de una semana
  const obtenerSemana = (fecha: Date) => {
    const inicio = new Date(fecha)
    const dia = inicio.getDay()
    const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1) // Lunes como primer día
    inicio.setDate(diff)
    inicio.setHours(0, 0, 0, 0)

    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    fin.setHours(23, 59, 59, 999)

    return { inicio, fin }
  }

  // Función para crear una nueva semana
  const crearNuevaSemana = (fecha: Date = new Date(), actividadesPersonalizadas?: Actividad[]) => {
    const { inicio, fin } = obtenerSemana(fecha)
    const id = `${inicio.getFullYear()}-W${Math.ceil((inicio.getTime() - new Date(inicio.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`

    // Si hay actividades personalizadas (de una semana anterior), usarlas como base
    // Si no, empezar con lista vacía
    const actividadesBase = actividadesPersonalizadas
      ? actividadesPersonalizadas.map((act) => ({ ...act, horasCompletadas: 0 }))
      : []

    return {
      id,
      fechaInicio: inicio,
      fechaFin: fin,
      actividades: actividadesBase,
      completada: false,
    }
  }

  // Inicializar con la semana actual
  useEffect(() => {
    const semanaActual = crearNuevaSemana()
    setSemanas([semanaActual])
    setActividades(semanaActual.actividades)
  }, [])

  // Obtener semana actual
  const semanaActual = semanas[semanaActualIndex]

  // Calcular estadísticas
  const totalHoras = actividades.reduce((sum, actividad) => sum + actividad.horas, 0)
  const totalCompletadas = actividades.reduce((sum, actividad) => sum + actividad.horasCompletadas, 0)
  const horasRestantes = 168 - totalHoras
  const progresoGeneral = totalHoras > 0 ? (totalCompletadas / totalHoras) * 100 : 0

  // Función para guardar cambios en la semana actual
  const guardarSemana = () => {
    if (semanaActual) {
      const semanasActualizadas = [...semanas]
      semanasActualizadas[semanaActualIndex] = {
        ...semanaActual,
        actividades: [...actividades],
        completada: progresoGeneral >= 100,
      }
      setSemanas(semanasActualizadas)
    }
  }

  // Función para eliminar una semana
  const eliminarSemana = (indexAEliminar: number) => {
    // No permitir eliminar si solo hay una semana
    if (semanas.length <= 1) {
      alert("No puedes eliminar la única semana. Debe haber al menos una semana.")
      return
    }

    const nuevasSemanas = semanas.filter((_, index) => index !== indexAEliminar)
    setSemanas(nuevasSemanas)

    // Ajustar el índice de la semana actual
    if (indexAEliminar === semanaActualIndex) {
      // Si eliminamos la semana actual, ir a la anterior o la primera
      const nuevoIndex = indexAEliminar > 0 ? indexAEliminar - 1 : 0
      setSemanaActualIndex(nuevoIndex)
      setActividades([...nuevasSemanas[nuevoIndex].actividades])
    } else if (indexAEliminar < semanaActualIndex) {
      // Si eliminamos una semana anterior, ajustar el índice
      setSemanaActualIndex(semanaActualIndex - 1)
    }

    setMostrarConfirmacionEliminar(null)
  }

  // Función para navegar a la semana anterior
  const irSemanaAnterior = () => {
    if (semanaActualIndex > 0) {
      guardarSemana()
      setSemanaActualIndex(semanaActualIndex - 1)
      setActividades([...semanas[semanaActualIndex - 1].actividades])
    }
  }

  // Función para navegar a la semana siguiente
  const irSemanaSiguiente = () => {
    guardarSemana()

    if (semanaActualIndex < semanas.length - 1) {
      // Ir a semana existente
      setSemanaActualIndex(semanaActualIndex + 1)
      setActividades([...semanas[semanaActualIndex + 1].actividades])
    } else {
      // Crear nueva semana usando las actividades de la semana actual como plantilla
      const fechaSiguiente = new Date(semanaActual.fechaInicio)
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 7)
      const nuevaSemana = crearNuevaSemana(fechaSiguiente, actividades)

      setSemanas([...semanas, nuevaSemana])
      setSemanaActualIndex(semanas.length)
      setActividades([...nuevaSemana.actividades])
    }
  }

  // Función para crear nueva semana desde cero
  const crearSemanaNueva = () => {
    guardarSemana()
    const fechaSiguiente = new Date(semanaActual.fechaInicio)
    fechaSiguiente.setDate(fechaSiguiente.getDate() + 7)
    // Usar las actividades actuales como plantilla para la nueva semana
    const nuevaSemana = crearNuevaSemana(fechaSiguiente, actividades)

    setSemanas([...semanas, nuevaSemana])
    setSemanaActualIndex(semanas.length)
    setActividades([...nuevaSemana.actividades])
  }

  // Función para resetear semana actual
  const resetearSemana = () => {
    if (confirm("¿Estás seguro de que quieres resetear el progreso de esta semana?")) {
      const actividadesReseteadas = actividades.map((act) => ({ ...act, horasCompletadas: 0 }))
      setActividades(actividadesReseteadas)
    }
  }

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const agregarActividad = () => {
    if (nuevaActividad.trim() && nuevasHoras.trim()) {
      const horas = Number.parseFloat(nuevasHoras)
      if (horas >= 0) {
        const nuevaId = Math.max(...actividades.map((a) => a.id), 0) + 1
        setActividades([
          ...actividades,
          {
            id: nuevaId,
            nombre: nuevaActividad.trim(),
            horas: horas,
            horasCompletadas: 0,
          },
        ])
        setNuevaActividad("")
        setNuevasHoras("")
      }
    }
  }

  const eliminarActividad = (id: number) => {
    setActividades(actividades.filter((actividad) => actividad.id !== id))
  }

  const iniciarEdicion = (id: number, valorActual: number) => {
    setEditandoId(id)
    setValorTemporal(valorActual.toString())
  }

  const guardarEdicion = (id: number) => {
    const nuevasHoras = Number.parseFloat(valorTemporal)
    if (nuevasHoras >= 0) {
      setActividades(
        actividades.map((actividad) => (actividad.id === id ? { ...actividad, horas: nuevasHoras } : actividad)),
      )
    }
    setEditandoId(null)
    setValorTemporal("")
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setValorTemporal("")
  }

  const iniciarEdicionProgreso = (id: number, valorActual: number) => {
    setEditandoProgreso(id)
    setProgresoTemporal(valorActual.toString())
  }

  const guardarEdicionProgreso = (id: number) => {
    const nuevasHorasCompletadas = Number.parseFloat(progresoTemporal)
    if (nuevasHorasCompletadas >= 0) {
      setActividades(
        actividades.map((actividad) =>
          actividad.id === id ? { ...actividad, horasCompletadas: nuevasHorasCompletadas } : actividad,
        ),
      )
    }
    setEditandoProgreso(null)
    setProgresoTemporal("")
  }

  const cancelarEdicionProgreso = () => {
    setEditandoProgreso(null)
    setProgresoTemporal("")
  }

  const iniciarAgregarHoras = (id: number) => {
    setAgregandoHoras(id)
    setHorasAAgregar("")
  }

  const agregarHorasCompletadas = (id: number) => {
    const horas = Number.parseFloat(horasAAgregar)
    if (horas > 0) {
      setActividades(
        actividades.map((actividad) =>
          actividad.id === id ? { ...actividad, horasCompletadas: actividad.horasCompletadas + horas } : actividad,
        ),
      )
    }
    setAgregandoHoras(null)
    setHorasAAgregar("")
  }

  const restarHorasCompletadas = (id: number) => {
    const horas = Number.parseFloat(horasAAgregar)
    if (horas > 0) {
      setActividades(
        actividades.map((actividad) =>
          actividad.id === id
            ? { ...actividad, horasCompletadas: Math.max(0, actividad.horasCompletadas - horas) }
            : actividad,
        ),
      )
    }
    setAgregandoHoras(null)
    setHorasAAgregar("")
  }

  const cancelarAgregarHoras = () => {
    setAgregandoHoras(null)
    setHorasAAgregar("")
  }

  const calcularProgreso = (actividad: Actividad) => {
    if (actividad.horas === 0) return 0
    return Math.min((actividad.horasCompletadas / actividad.horas) * 100, 100)
  }

  const obtenerColorProgreso = (porcentaje: number) => {
    if (porcentaje >= 100) return "bg-green-500"
    if (porcentaje >= 75) return "bg-blue-500"
    if (porcentaje >= 50) return "bg-yellow-500"
    if (porcentaje >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  // Auto-guardar cuando cambian las actividades
  useEffect(() => {
    if (semanaActual && actividades.length > 0) {
      const timeoutId = setTimeout(() => {
        guardarSemana()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [actividades])

  if (!semanaActual) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Agenda Semanal</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestiona tus actividades y el tiempo dedicado a cada una</p>
        </div>

        {/* Navegación de semanas - Responsive */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            {/* Navegación principal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Controles de navegación */}
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={irSemanaAnterior}
                  disabled={semanaActualIndex === 0}
                  className="flex-shrink-0 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <div className="text-center flex-1 min-w-0">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-lg truncate">
                      Semana {semanaActualIndex + 1} de {semanas.length}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">
                    {formatearFecha(semanaActual.fechaInicio)} - {formatearFecha(semanaActual.fechaFin)}
                  </div>
                  {semanaActual.completada && (
                    <div className="text-xs sm:text-sm text-green-600 font-medium">✓ Completada</div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={irSemanaSiguiente}
                  className="flex-shrink-0 bg-transparent"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4 sm:ml-2" />
                </Button>
              </div>

              {/* Botones de acción - Stack en móvil */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={guardarSemana}>
                  <Save className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Guardar</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetearSemana}
                  className="text-orange-600 hover:text-orange-700 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Reset</span>
                </Button>

                <Button variant="outline" size="sm" onClick={crearSemanaNueva}>
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Nueva</span>
                </Button>

                {semanas.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarConfirmacionEliminar(semanaActualIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Eliminar</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de confirmación para eliminar semana */}
        {mostrarConfirmacionEliminar !== null && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-800">Confirmar Eliminación</h3>
                  <p className="text-sm text-red-700 mt-1">
                    ¿Eliminar la Semana {mostrarConfirmacionEliminar + 1}?
                    <br />
                    <span className="font-medium text-xs sm:text-sm">
                      ({formatearFecha(semanas[mostrarConfirmacionEliminar].fechaInicio)} -{" "}
                      {formatearFecha(semanas[mostrarConfirmacionEliminar].fechaFin)})
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMostrarConfirmacionEliminar(null)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => eliminarSemana(mostrarConfirmacionEliminar)}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de semanas - Responsive grid */}
        {semanas.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Historial de Semanas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {semanas.map((semana, index) => {
                  const totalHorasSemana = semana.actividades.reduce((sum, act) => sum + act.horas, 0)
                  const totalCompletadasSemana = semana.actividades.reduce((sum, act) => sum + act.horasCompletadas, 0)
                  const progresoSemana = totalHorasSemana > 0 ? (totalCompletadasSemana / totalHorasSemana) * 100 : 0

                  return (
                    <div
                      key={semana.id}
                      className={`relative p-2 sm:p-3 border rounded-lg transition-colors cursor-pointer ${
                        index === semanaActualIndex ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        guardarSemana()
                        setSemanaActualIndex(index)
                        setActividades([...semana.actividades])
                      }}
                    >
                      {semanas.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMostrarConfirmacionEliminar(index)
                          }}
                          className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      )}

                      <div className="text-xs sm:text-sm font-medium truncate pr-6">Semana {index + 1}</div>
                      <div className="text-xs text-gray-600 truncate">{formatearFecha(semana.fechaInicio)}</div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                          <div
                            className={`h-1 sm:h-1.5 rounded-full ${obtenerColorProgreso(progresoSemana)}`}
                            style={{ width: `${Math.min(progresoSemana, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{progresoSemana.toFixed(0)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen de horas - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalHoras}</div>
              <div className="text-xs sm:text-sm text-gray-600">Planificadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{totalCompletadas}</div>
              <div className="text-xs sm:text-sm text-gray-600">Completadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{progresoGeneral.toFixed(1)}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Progreso</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div
                className={`text-xl sm:text-2xl font-bold ${horasRestantes >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {horasRestantes}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Disponibles</div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de progreso general */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="font-medium text-sm sm:text-base">Progreso Semanal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${obtenerColorProgreso(progresoGeneral)}`}
                style={{ width: `${Math.min(progresoGeneral, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">
              {totalCompletadas} de {totalHoras} horas completadas
            </div>
          </CardContent>
        </Card>

        {/* Agregar nueva actividad - Responsive form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Agregar Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Label htmlFor="nueva-actividad" className="text-sm">
                  Nombre de la actividad
                </Label>
                <Input
                  id="nueva-actividad"
                  placeholder="Ej: Deporte, Estudio, Trabajo..."
                  value={nuevaActividad}
                  onChange={(e) => setNuevaActividad(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarActividad()}
                  className="mt-1"
                />
              </div>
              <div className="w-full sm:w-32">
                <Label htmlFor="nuevas-horas" className="text-sm">
                  Horas/semana
                </Label>
                <Input
                  id="nuevas-horas"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={nuevasHoras}
                  onChange={(e) => setNuevasHoras(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarActividad()}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={agregarActividad}
                  disabled={!nuevaActividad.trim() || !nuevasHoras.trim()}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de actividades - Responsive */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Mis Actividades ({actividades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {actividades.map((actividad) => {
                const progreso = calcularProgreso(actividad)
                const horasFaltantes = Math.max(actividad.horas - actividad.horasCompletadas, 0)

                return (
                  <div key={actividad.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Header de la actividad */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base sm:text-lg truncate">{actividad.nombre}</h3>
                        <div className="text-xs sm:text-sm text-gray-600">Meta: {actividad.horas} horas/semana</div>
                      </div>

                      {/* Controles de edición */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {editandoId === actividad.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={valorTemporal}
                              onChange={(e) => setValorTemporal(e.target.value)}
                              className="w-16 sm:w-20 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") guardarEdicion(actividad.id)
                                if (e.key === "Escape") cancelarEdicion()
                              }}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={() => guardarEdicion(actividad.id)}>
                              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelarEdicion}>
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="font-semibold text-sm">{actividad.horas}h</div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => iniciarEdicion(actividad.id, actividad.horas)}
                            >
                              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarActividad(actividad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs sm:text-sm font-medium">Progreso</span>
                        <span className="text-xs sm:text-sm text-gray-600">{progreso.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${obtenerColorProgreso(progreso)}`}
                          style={{ width: `${Math.min(progreso, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Controles de horas */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          <span className="text-xs sm:text-sm">
                            <span className="font-semibold text-green-600">{actividad.horasCompletadas}</span>{" "}
                            completadas
                          </span>
                        </div>

                        {/* Botones para agregar/quitar horas */}
                        {agregandoHoras === actividad.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="Horas"
                              value={horasAAgregar}
                              onChange={(e) => setHorasAAgregar(e.target.value)}
                              className="w-16 sm:w-20 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") agregarHorasCompletadas(actividad.id)
                                if (e.key === "Escape") cancelarAgregarHoras()
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => agregarHorasCompletadas(actividad.id)}
                              disabled={!horasAAgregar.trim()}
                            >
                              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restarHorasCompletadas(actividad.id)}
                              disabled={!horasAAgregar.trim()}
                            >
                              <MinusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelarAgregarHoras}>
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => iniciarAgregarHoras(actividad.id)}
                            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                          >
                            <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Agregar
                          </Button>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-gray-600">
                        {horasFaltantes > 0 ? (
                          <span className="text-orange-600">Faltan: {horasFaltantes}h</span>
                        ) : (
                          <span className="text-green-600">¡Completada!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Advertencia si se exceden las horas */}
        {horasRestantes < 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 text-red-700">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  ¡Atención! Has asignado {Math.abs(horasRestantes)} horas más de las disponibles en una semana.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
