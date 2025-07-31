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

  // Función para obtener las actividades base (siempre las mismas)
  const obtenerActividadesBase = (): Actividad[] => {
    return [
      { id: 1, nombre: "Deporte", horas: 5, horasCompletadas: 0 },
      { id: 2, nombre: "Academia aprendizaje, estudio", horas: 10, horasCompletadas: 0 },
      { id: 3, nombre: "Política y concejales", horas: 8, horasCompletadas: 0 },
      {
        id: 4,
        nombre: "Administrativos, seguimiento tareas, visitas secretarias, empresas",
        horas: 12,
        horasCompletadas: 0,
      },
      { id: 5, nombre: "Gestión", horas: 15, horasCompletadas: 0 },
      { id: 6, nombre: "Conversaciones secretarios", horas: 4, horasCompletadas: 0 },
      { id: 7, nombre: "Cap nuevos liderazgos - Almuerzo", horas: 3, horasCompletadas: 0 },
      { id: 8, nombre: "Temas personales", horas: 6, horasCompletadas: 0 },
      { id: 9, nombre: "Atención comunidad y recorridos barrios", horas: 8, horasCompletadas: 0 },
      { id: 10, nombre: "Estrateg comunicaciones y eventos equipo político", horas: 6, horasCompletadas: 0 },
      { id: 11, nombre: "Visitas a casas", horas: 4, horasCompletadas: 0 },
      { id: 12, nombre: "Sostenimiento equipo", horas: 5, horasCompletadas: 0 },
    ]
  }

  // Función para crear una nueva semana
  const crearNuevaSemana = (fecha: Date = new Date(), actividadesPersonalizadas?: Actividad[]) => {
    const { inicio, fin } = obtenerSemana(fecha)
    const id = `${inicio.getFullYear()}-W${Math.ceil((inicio.getTime() - new Date(inicio.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`

    // Si hay actividades personalizadas (de una semana anterior), usarlas como base
    // Si no, usar las actividades predeterminadas
    const actividadesBase = actividadesPersonalizadas
      ? actividadesPersonalizadas.map((act) => ({ ...act, horasCompletadas: 0 }))
      : obtenerActividadesBase()

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
    return <div>Cargando...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Mi Agenda Semanal</h1>
        <p className="text-muted-foreground">Gestiona tus actividades y el tiempo dedicado a cada una</p>
      </div>

      {/* Navegación de semanas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={irSemanaAnterior} disabled={semanaActualIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Semana Anterior
              </Button>

              <div className="text-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-lg">
                    Semana {semanaActualIndex + 1} de {semanas.length}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatearFecha(semanaActual.fechaInicio)} - {formatearFecha(semanaActual.fechaFin)}
                </div>
                {semanaActual.completada && (
                  <div className="text-sm text-green-600 font-medium">✓ Semana Completada</div>
                )}
              </div>

              <Button variant="outline" onClick={irSemanaSiguiente}>
                Semana Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={guardarSemana}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetearSemana}
                className="text-orange-600 hover:text-orange-700 bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>

              <Button variant="outline" size="sm" onClick={crearSemanaNueva}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Semana
              </Button>

              {/* Botón para eliminar semana actual */}
              {semanas.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarConfirmacionEliminar(semanaActualIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Semana
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
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Confirmar Eliminación</h3>
                <p className="text-sm text-red-700 mt-1">
                  ¿Estás seguro de que quieres eliminar la Semana {mostrarConfirmacionEliminar + 1}?
                  <br />
                  <span className="font-medium">
                    ({formatearFecha(semanas[mostrarConfirmacionEliminar].fechaInicio)} -{" "}
                    {formatearFecha(semanas[mostrarConfirmacionEliminar].fechaFin)})
                  </span>
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Esta acción no se puede deshacer. Se perderá todo el progreso de esta semana.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMostrarConfirmacionEliminar(null)}
                  className="text-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => eliminarSemana(mostrarConfirmacionEliminar)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de semanas */}
      {semanas.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de Semanas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {semanas.map((semana, index) => {
                const totalHorasSemana = semana.actividades.reduce((sum, act) => sum + act.horas, 0)
                const totalCompletadasSemana = semana.actividades.reduce((sum, act) => sum + act.horasCompletadas, 0)
                const progresoSemana = totalHorasSemana > 0 ? (totalCompletadasSemana / totalHorasSemana) * 100 : 0

                return (
                  <div
                    key={semana.id}
                    className={`relative p-3 border rounded-lg transition-colors ${
                      index === semanaActualIndex ? "border-blue-500 bg-blue-50" : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Botón de eliminar en la esquina */}
                    {semanas.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMostrarConfirmacionEliminar(index)
                        }}
                        className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}

                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        guardarSemana()
                        setSemanaActualIndex(index)
                        setActividades([...semana.actividades])
                      }}
                    >
                      <div className="text-sm font-medium">Semana {index + 1}</div>
                      <div className="text-xs text-muted-foreground">{formatearFecha(semana.fechaInicio)}</div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${obtenerColorProgreso(progresoSemana)}`}
                            style={{ width: `${Math.min(progresoSemana, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {progresoSemana.toFixed(0)}% completado
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de horas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalHoras}</div>
            <div className="text-sm text-muted-foreground">Horas planificadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompletadas}</div>
            <div className="text-sm text-muted-foreground">Horas completadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{progresoGeneral.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Progreso general</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${horasRestantes >= 0 ? "text-green-600" : "text-red-600"}`}>
              {horasRestantes}
            </div>
            <div className="text-sm text-muted-foreground">Horas disponibles</div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progreso general */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Progreso de la Semana Actual</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${obtenerColorProgreso(progresoGeneral)}`}
              style={{ width: `${Math.min(progresoGeneral, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {totalCompletadas} de {totalHoras} horas completadas
          </div>
        </CardContent>
      </Card>

      {/* Agregar nueva actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Nueva Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="nueva-actividad">Nombre de la actividad</Label>
              <Input
                id="nueva-actividad"
                placeholder="Ej: Reuniones adicionales, Capacitaciones, etc."
                value={nuevaActividad}
                onChange={(e) => setNuevaActividad(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarActividad()}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="nuevas-horas">Horas/semana</Label>
              <Input
                id="nuevas-horas"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={nuevasHoras}
                onChange={(e) => setNuevasHoras(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarActividad()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={agregarActividad} disabled={!nuevaActividad.trim() || !nuevasHoras.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de actividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mis Actividades ({actividades.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actividades.map((actividad) => {
              const progreso = calcularProgreso(actividad)
              const horasFaltantes = Math.max(actividad.horas - actividad.horasCompletadas, 0)

              return (
                <div key={actividad.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{actividad.nombre}</h3>
                      <div className="text-sm text-muted-foreground">Meta: {actividad.horas} horas/semana</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Editar meta de horas */}
                      {editandoId === actividad.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={valorTemporal}
                            onChange={(e) => setValorTemporal(e.target.value)}
                            className="w-20"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") guardarEdicion(actividad.id)
                              if (e.key === "Escape") cancelarEdicion()
                            }}
                            autoFocus
                          />
                          <span className="text-sm text-muted-foreground">h/sem</span>
                          <Button size="sm" variant="ghost" onClick={() => guardarEdicion(actividad.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelarEdicion}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right">
                            <div className="font-semibold">{actividad.horas} horas</div>
                            <div className="text-sm text-muted-foreground">meta</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => iniciarEdicion(actividad.id, actividad.horas)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => eliminarActividad(actividad.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Progreso</span>
                      <span className="text-sm text-muted-foreground">{progreso.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${obtenerColorProgreso(progreso)}`}
                        style={{ width: `${Math.min(progreso, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Horas completadas y controles */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          <span className="font-semibold text-green-600">{actividad.horasCompletadas}</span> completadas
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
                            className="w-20"
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
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restarHorasCompletadas(actividad.id)}
                            disabled={!horasAAgregar.trim()}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelarAgregarHoras}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => iniciarAgregarHoras(actividad.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Agregar horas
                        </Button>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {horasFaltantes > 0 ? (
                        <span className="text-orange-600">Faltan: {horasFaltantes} horas</span>
                      ) : (
                        <span className="text-green-600">¡Meta completada!</span>
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
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                ¡Atención! Has asignado {Math.abs(horasRestantes)} horas más de las disponibles en una semana.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
